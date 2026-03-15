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
import random
import tempfile

import asyncpg
import boto3
from dotenv import load_dotenv

from livekit import agents, api, rtc
from livekit.agents import AgentServer, AgentSession, Agent, ConversationItemAddedEvent, JobContext, room_io
from livekit.agents.utils.audio import audio_frames_from_file
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


async def _save_recording_key(call_id: int | None, key: str) -> None:
    if call_id is None:
        return
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.warning("DATABASE_URL not set; skipping recording key save")
        return
    try:
        conn = await asyncpg.connect(database_url)
        try:
            await conn.execute(
                'UPDATE "Calls" SET "callRecordingKey" = $1, "updatedAt" = NOW() WHERE id = $2',
                key,
                call_id,
            )
            logger.info("call_id=%s recording key saved: %s", call_id, key)
        finally:
            await conn.close()
    except Exception as exc:
        logger.error("Failed to save recording key for call_id=%s: %s", call_id, exc)


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


async def _download_recording(key: str) -> str:
    """Download a recording from S3 to a local temp file. Returns the local path."""
    bucket = os.environ["S3_BUCKET_NAME"]
    region = os.getenv("AWS_REGION", "us-east-1")

    def _sync_download() -> str:
        s3 = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        suffix = "." + key.rsplit(".", 1)[-1] if "." in key else ".webm"
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.close()
        s3.download_file(bucket, key, tmp.name)
        return tmp.name

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _sync_download)


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

    # ── Pre-download recording while the phone is ringing ────────────────────
    local_recording: str | None = None
    if recordingFile:
        try:
            local_recording = await _download_recording(recordingFile)
            logger.info("Recording pre-downloaded for call_id=%s  key=%s", call_id, recordingFile)
        except Exception as exc:
            logger.warning("Failed to pre-download recording for call_id=%s: %s", call_id, exc)

    # ── Dial the outbound number ─────────────────────────────────────────────
    sip_trunk_id = os.environ[random.choice(["SIP_OUTBOUND_TRUNK_ID_TWILIO_1", "SIP_OUTBOUND_TRUNK_ID_TWILIO_2"])]
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
        if local_recording:
            try:
                os.unlink(local_recording)
            except OSError:
                pass
        await session.aclose()
        return

    # ── Start egress recording to S3 ────────────────────────────────────────
    egress_id: str | None = None
    recording_key = f"call-recordings/call-{call_id}.mp3"
    try:
        egress_info = await ctx.api.egress.start_room_composite_egress(
            api.RoomCompositeEgressRequest(
                room_name=ctx.room.name,
                audio_only=True,
                file_outputs=[
                    api.EncodedFileOutput(
                        file_type=api.EncodedFileType.MP3,
                        filepath=f"call-recordings/call-{call_id}",
                        s3=api.S3Upload(
                            access_key=os.getenv("AWS_ACCESS_KEY_ID", ""),
                            secret=os.getenv("AWS_SECRET_ACCESS_KEY", ""),
                            region=os.getenv("AWS_REGION", "us-east-1"),
                            bucket=os.environ["S3_BUCKET_NAME"],
                        ),
                    )
                ],
            )
        )
        egress_id = egress_info.egress_id
        logger.info("Egress started — call_id=%s  egress_id=%s  key=%s", call_id, egress_id, recording_key)
        await _save_recording_key(call_id, recording_key)
    except Exception as exc:
        logger.error("Failed to start egress for call_id=%s: %s", call_id, exc)

    async def _stop_egress() -> None:
        if egress_id:
            try:
                await ctx.api.egress.stop_egress(api.StopEgressRequest(egress_id=egress_id))
                logger.info("Egress stopped — call_id=%s  egress_id=%s", call_id, egress_id)
            except Exception as exc:
                logger.warning("Failed to stop egress for call_id=%s: %s", call_id, exc)

    ctx.add_shutdown_callback(_stop_egress)

    # ── Hard duration guard ──────────────────────────────────────────────────
    # Fires at CALL_DURATION seconds. Attempts a direct TTS goodbye (no LLM),
    # then forces hangup after 10 s regardless of whether it finished.
    CALL_DURATION = 45

    async def _duration_guard() -> None:
        await asyncio.sleep(CALL_DURATION)
        logger.info("Duration limit reached — call_id=%s, saying goodbye", call_id)
        try:
            session.interrupt(force=True)
            await asyncio.wait_for(
                session.say(
                    "The call time limit has been reached. Thank you so much for your time. Goodbye!",
                    allow_interruptions=False,
                ),
                timeout=10.0,
            )
        except asyncio.TimeoutError:
            logger.warning("Goodbye timed out — call_id=%s, forcing hangup", call_id)
        except Exception as exc:
            logger.warning("Goodbye error — call_id=%s: %s", call_id, exc)
        try:
            await _hangup(ctx)
        except Exception as exc:
            logger.warning("Hangup error (room may already be gone) — call_id=%s: %s", call_id, exc)
        await session.aclose()

    asyncio.create_task(_duration_guard())

    # ── Play pre-recorded greeting if provided ───────────────────────────────
    if local_recording:
        try:
            logger.info("Playing recording for call_id=%s  key=%s", call_id, recordingFile)
            await session.say(
                "",
                audio=audio_frames_from_file(local_recording, sample_rate=24000, num_channels=1),
                allow_interruptions=False,
            )
        except Exception as exc:
            logger.warning("Failed to play recording for call_id=%s: %s", call_id, exc)
        finally:
            try:
                os.unlink(local_recording)
            except OSError as e:
                logger.warning("Failed to delete temp recording %s: %s", local_recording, e)

    # ── Hand off to the live agent ───────────────────────────────────────────
    # Whether or not a recording played, the agent now takes over the call.
    # instructions are required here since there's no prior user message to respond to.
    await session.generate_reply(
        instructions=(
            "The introduction has just finished. "
            "Continue the conversation naturally based on your instructions. "
            "Greet the person and proceed with the purpose of the call."
        )
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
