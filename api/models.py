from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from prisma.enums import CallStatus


class CallCreate(BaseModel):
    to: str
    prompt: str
    scheduledTime: datetime
    humanNumber: Optional[str] = None
    language: Optional[str] = "English"
    recordingFile: Optional[str] = None


class CallResponse(BaseModel):
    id: int
    to: str
    prompt: str
    humanNumber: Optional[str] = None
    transcription: Optional[str] = None
    recordingFile: Optional[str] = None
    callRecordingKey: Optional[str] = None
    language: Optional[str] = None
    status: CallStatus
    scheduledTime: datetime
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


class PaginatedCallResponse(BaseModel):
    total: int
    page: int
    pageSize: int
    items: list[CallResponse]
