"""
handler.py — LiveKit agent worker for voice-agent-ayush.

Standalone service that connects to LiveKit Cloud and processes every job
dispatched to the 'voice-agent-ayush' agent. Run with:

    python handler.py start    # production
    python handler.py dev      # development / hot-reload
    python handler.py console  # local terminal testing
"""

import asyncio
import json
import logging
import os

import asyncpg
from dotenv import load_dotenv

from livekit import agents, api, rtc
from livekit.agents import AgentServer, AgentSession, Agent, ConversationItemAddedEvent, JobContext, room_io
from livekit.plugins import deepgram, google, noise_cancellation, silero

load_dotenv()

logger = logging.getLogger(__name__)

AGENT_NAME = "voice-agent-ayush"

EXAMPLE_PROMPT = (
    "You are a friendly and professional voice assistant making an outbound call. "
    "Introduce yourself, state the purpose of the call clearly, and assist the "
    "person on the other end with their enquiry. Keep responses concise and natural."
)

# Maps full language names (stored in DB) to BCP-47 codes for Deepgram STT.
LANGUAGE_CODES: dict[str, str] = {
    "English": "en",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Italian": "it",
    "Portuguese": "pt",
    "Chinese": "zh",
    "Japanese": "ja",
    "Korean": "ko",
    "Arabic": "ar",
    "Hindi": "hi",
    "Russian": "ru",
    "Dutch": "nl",
    "Turkish": "tr",
    "Polish": "pl",
    "Swedish": "sv",
}


class OutboundAssistant(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(instructions=instructions)


async def _hangup(ctx: JobContext) -> None:
    await ctx.api.room.delete_room(api.DeleteRoomRequest(room=ctx.room.name))


async def _save_transcript(call_id: int | None, transcript: str) -> None:
    if call_id is None:
        return
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.warning("DATABASE_URL not set; skipping transcript save")
        return
    try:
        conn = await asyncpg.connect(database_url)
        try:
            await conn.execute(
                'UPDATE "Calls" SET transcription = $1, "updatedAt" = NOW() WHERE id = $2',
                transcript,
                call_id,
            )
            logger.info("call_id=%s transcript saved (%d chars)", call_id, len(transcript))
        finally:
            await conn.close()
    except Exception as exc:
        logger.error("Failed to save transcript for call_id=%s: %s", call_id, exc)


async def _update_call_status(call_id: int | None, status: str) -> None:
    if call_id is None:
        return
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.warning("DATABASE_URL not set; skipping status update")
        return
    try:
        conn = await asyncpg.connect(database_url)
        try:
            await conn.execute(
                'UPDATE "Calls" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
                status,
                call_id,
            )
            logger.info("call_id=%s status → %s", call_id, status)
        finally:
            await conn.close()
    except Exception as exc:
        logger.error("Failed to update call_id=%s status: %s", call_id, exc)


server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def handle_job(ctx: JobContext) -> None:
    """
    Entrypoint executed for every job dispatched to voice-agent-ayush.

    Metadata fields injected by dispatcher.py:
        call_id      – database primary key of the Call record
        to           – destination phone number
        human_number – human-readable caller number (optional)
        prompt       – per-call system prompt override (optional)
    """
    # ── Parse dispatch metadata ──────────────────────────────────────────────
    metadata: dict = json.loads(ctx.job.metadata or "{}")

    call_id = metadata.get("call_id")
    to = metadata.get("to")
    human_number = metadata.get("human_number")
    prompt = metadata.get("prompt") or EXAMPLE_PROMPT
    language = metadata.get("language", "English")
    recordingFile = metadata.get("recordingFile") or None
    language_code = LANGUAGE_CODES.get(language, "en")

    logger.info(
        "Job received — call_id=%s  to=%s  human_number=%s",
        call_id,
        to,
        human_number,
    )

    # ── Connect to the LiveKit room ──────────────────────────────────────────
    await ctx.connect()

    # ── Build agent session with STT / LLM / TTS ────────────────────────────
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language=language_code),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=deepgram.TTS(model="aura-2-asteria-en"),
        vad=silero.VAD.load(),
    )

    # ── Transcript accumulator ───────────────────────────────────────────────
    transcript_turns: list[str] = []

    await session.start(
        room=ctx.room,
        agent=OutboundAssistant(instructions=prompt),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    @session.on("conversation_item_added")
    def _on_item_added(ev: ConversationItemAddedEvent) -> None:
        role = "User" if ev.item.role == "user" else "Agent"
        text = ev.item.text_content
        if text:
            transcript_turns.append(f"{role}: {text}")

    async def _persist_transcript() -> None:
        if transcript_turns:
            await _save_transcript(call_id, "\n".join(transcript_turns))

    ctx.add_shutdown_callback(_persist_transcript)

    # ── Dial the outbound number ─────────────────────────────────────────────
    sip_trunk_id = os.environ["SIP_OUTBOUND_TRUNK_ID_TWILIO"]
    try:
        await ctx.api.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=ctx.room.name,
                sip_trunk_id=sip_trunk_id,
                sip_call_to=to,
                participant_identity=to,
                wait_until_answered=True,
            )
        )
        logger.info("Call answered — call_id=%s  to=%s", call_id, to)
    except api.TwirpError as exc:
        logger.error(
            "SIP error for call_id=%s: %s (SIP %s %s)",
            call_id,
            exc.message,
            exc.metadata.get("sip_status_code"),
            exc.metadata.get("sip_status"),
        )
        await _update_call_status(call_id, "ERROR")
        await session.aclose()
        return

    # ── 90-second hard duration guard ───────────────────────────────────────
    # Sleep 65 s, leaving 25 s for the goodbye phrase + hangup = 90 s max total.
    GOODBYE_BUDGET = 25  # seconds reserved for TTS generation + audio playback
    async def _duration_guard() -> None:
        await asyncio.sleep(90 - GOODBYE_BUDGET)
        logger.info("Duration limit reached — call_id=%s, saying goodbye", call_id)
        try:
            await asyncio.wait_for(
                session.generate_reply(
                    instructions=(
                        "The call time limit has been reached. "
                        "Say a warm, brief goodbye and thank the person for their time. "
                        "Do not ask any follow-up questions."
                    ),
                    allow_interruptions=False,
                ),
                timeout=float(GOODBYE_BUDGET),
            )
        except asyncio.TimeoutError:
            logger.warning("Goodbye reply timed out — call_id=%s, forcing hangup", call_id)
        except Exception as exc:
            logger.warning("Goodbye generation error: %s", exc)
        await _hangup(ctx)
        await session.aclose()

    asyncio.create_task(_duration_guard())


if __name__ == "__main__":
    agents.cli.run_app(server)
