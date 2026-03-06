from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class CallStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    ERROR = "ERROR"


class Call(BaseModel):
    id: int
    to: str
    prompt: str
    humanNumber: Optional[str] = None
    transcription: Optional[str] = None
    recordingFile: Optional[str] = None
    language: Optional[str] = "English"
    status: CallStatus
    scheduledTime: datetime
    createdAt: datetime
    updatedAt: datetime
