import asyncio
import logging
import os
from datetime import datetime, timezone

import asyncpg
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

from dispatcher import dispatch
from models import Call

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")


async def fetch_pending_calls(conn: asyncpg.Connection) -> list[Call]:
    rows = await conn.fetch(
        """
        SELECT id, "to", prompt, "humanNumber", transcription, status,
               "scheduledTime", "recordingFile", "language", "createdAt", "updatedAt"
        FROM "Calls"
        WHERE status = 'PENDING'
          AND "scheduledTime" <= NOW()
        ORDER BY "createdAt" ASC
        """
    )
    return [Call(**dict(row)) for row in rows]


async def run_job() -> None:
    logger.info("Running pending calls job...")

    try:
        conn = await asyncpg.connect(DATABASE_URL)
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return

    try:
        calls = await fetch_pending_calls(conn)
        logger.info(f"Found {len(calls)} pending call(s)")

        for call in calls:
            try:
                await dispatch(call)
            except NotImplementedError:
                logger.warning(f"Call {call.id}: dispatcher not yet implemented")
            except Exception as e:
                logger.error(f"Call {call.id}: dispatch failed — {e}")
    finally:
        await conn.close()


async def main() -> None:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_job,
        trigger="interval",
        minutes=1,
        next_run_time=datetime.now(timezone.utc),  # fire immediately on startup
    )
    scheduler.start()

    logger.info("Worker started. Polling every 1 minute.")

    try:
        await asyncio.Event().wait()
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())
