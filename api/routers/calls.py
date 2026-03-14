import os
from datetime import datetime
from typing import Optional

import boto3
from fastapi import APIRouter, HTTPException, Query
from db import db
from models import CallCreate, CallResponse, PaginatedCallResponse
from prisma.enums import CallStatus

PRESIGNED_GET_TTL = 3600  # 1 hour


def _presigned_get_url(key: str) -> str | None:
    bucket = os.getenv("S3_BUCKET_NAME")
    if not bucket:
        return None
    try:
        s3 = boto3.client(
            "s3",
            region_name=os.getenv("AWS_REGION", "us-east-1"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )
        return s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=PRESIGNED_GET_TTL,
        )
    except Exception:
        return None


def _enrich(call) -> CallResponse:
    data = CallResponse.model_validate(call)
    if data.callRecordingKey:
        data.callRecordingKey = _presigned_get_url(data.callRecordingKey) or data.callRecordingKey
    return data

router = APIRouter(prefix="/calls", tags=["calls"])

@router.post("", response_model=CallResponse, status_code=201)
async def create_call(payload: CallCreate):
    """Create a new scheduled call entry."""
    try:
        call = await db.calls.create(
            data={
                "to": payload.to,
                "prompt": payload.prompt,
                "scheduledTime": payload.scheduledTime,
                "humanNumber": payload.humanNumber,
                "language": payload.language,
                "recordingFile": payload.recordingFile
            }
        )
        return _enrich(call)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

@router.get("", response_model=PaginatedCallResponse)
async def get_calls(
    page: int = Query(default=0, ge=0),
    pageSize: int = Query(default=10, gt=0),
    status: Optional[CallStatus] = Query(default=None),
    startDate: Optional[datetime] = Query(
        default=None,
        description="Filter calls scheduled on or after this datetime (ISO 8601).",
    ),
    endDate: Optional[datetime] = Query(
        default=None,
        description="Filter calls scheduled on or before this datetime (ISO 8601).",
    ),
):
    """Return scheduled calls with pagination and filtering."""
    where: dict = {}

    if status:
        where["status"] = status

    if startDate or endDate:
        scheduled_filter: dict = {}
        if startDate:
            scheduled_filter["gte"] = startDate
        if endDate:
            scheduled_filter["lte"] = endDate
        where["scheduledTime"] = scheduled_filter

    try:
        # Get total count for pagination
        total = await db.calls.count(where=where)
        
        # Get paginated items
        calls = await db.calls.find_many(
            where=where,
            take=pageSize,
            skip=page * pageSize,
            order={"createdAt": "desc"}
        )
        
        return {
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "items": [_enrich(c) for c in calls],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
