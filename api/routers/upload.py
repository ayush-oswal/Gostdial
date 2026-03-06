import os
import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/upload", tags=["upload"])

# 5 MB — very generous for 1 minute of audio (WebM/Opus is typically < 1 MB/min)
MAX_UPLOAD_BYTES = 5 * 1024 * 1024
PRESIGNED_URL_TTL = 300  # 5 minutes


class PresignedUrlResponse(BaseModel):
    url: str
    key: str
    max_bytes: int


@router.post("/presigned-url", response_model=PresignedUrlResponse)
async def get_presigned_url():
    """Return a short-lived presigned S3 PUT URL and the object key for a recording upload."""
    bucket = os.getenv("S3_BUCKET_NAME")
    region = os.getenv("AWS_REGION", "us-east-1")

    if not bucket:
        raise HTTPException(status_code=500, detail="S3 bucket not configured on server")

    key = f"recordings/{uuid.uuid4()}.webm"

    try:
        s3 = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        )

        url = s3.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": bucket,
                "Key": key,
                "ContentType": "audio/webm",
            },
            ExpiresIn=PRESIGNED_URL_TTL,
        )

        return {"url": url, "key": key, "max_bytes": MAX_UPLOAD_BYTES}

    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {exc}")
