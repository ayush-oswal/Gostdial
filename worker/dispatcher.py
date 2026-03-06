import json
import logging
import os

import asyncpg
from livekit import api

from models import Call

logger = logging.getLogger(__name__)

AGENT_NAME = "voice-agent-ayush"


async def dispatch(call: Call) -> None:
    """
    Dispatcher service.

    Receives a PENDING Call record and creates an explicit LiveKit agent
    dispatch to 'voice-agent-ayush', passing the call details as JSON metadata.
    The room is auto-created by LiveKit if it doesn't already exist.

    Args:
        call: The Call object fetched from the database.
    """
    room_name = f"call-{call.id}"
    metadata = json.dumps(
        {
            "call_id": call.id,
            "to": call.to,
            "human_number": call.humanNumber,
            "language": call.language or "English",
            "recordingFile": call.recordingFile,
            "prompt": call.prompt
            or (
                "You are a friendly and professional voice assistant making an outbound call. "
                "Introduce yourself, state the purpose of the call, and assist the person on "
                "the other end with their enquiry."
            ),
        }
    )

    lkapi = api.LiveKitAPI(
        url=os.environ["LIVEKIT_URL"],
        api_key=os.environ["LIVEKIT_API_KEY"],
        api_secret=os.environ["LIVEKIT_API_SECRET"],
    )
    try:
        result = await lkapi.agent_dispatch.create_dispatch(
            api.CreateAgentDispatchRequest(
                agent_name=AGENT_NAME,
                room=room_name,
                metadata=metadata,
            )
        )
        logger.info(
            "Dispatched agent '%s' to room '%s' (dispatch_id=%s)",
            AGENT_NAME,
            room_name,
            result.id,
        )
        await _update_call_status(call.id, "SENT")
    finally:
        await lkapi.aclose()


async def _update_call_status(call_id: int, status: str) -> None:
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
