import asyncio
import os
from io import BytesIO

import aioboto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import settings
from app.strategies.cdn.base import CDNStrategy


class S3CDNStrategy(CDNStrategy):
    def __init__(self):
        self.bucket_name = settings.s3_bucket_name
        self.region_name = settings.aws_region        # ← was s3_region_name
        self.base_prefix = settings.s3_base_prefix.strip("/") if settings.s3_base_prefix else ""
        self.session = aioboto3.Session(
            aws_access_key_id=settings.aws_access_key_id,      # ← was s3_access_key_id
            aws_secret_access_key=settings.aws_secret_access_key,  # ← was s3_secret_access_key
            region_name=self.region_name,
        )

    def _build_key(self, filename: str) -> str:
        if self.base_prefix:
            return f"{self.base_prefix}/{filename}"
        return filename

    def _build_url(self, key: str) -> str:
        return f"https://{self.bucket_name}.s3.{self.region_name}.amazonaws.com/{key}"

    async def upload(self, data: bytes, filename: str) -> str:
        key = self._build_key(filename)

        def _upload():
            import boto3
            client = boto3.client(
                 "s3",
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=self.region_name,
            )
            client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=BytesIO(data),
            )

        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(None, _upload)
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(f"S3 upload failed for '{key}': {e}") from e

        return self._build_url(key)

    async def generate_presigned_url(self, filename: str, expiry: int = 3600) -> str:
        key = filename  # ← use as-is, already contains full path

        def _presign():
            import boto3
            client = boto3.client(
                 "s3",
                aws_access_key_id=settings.aws_access_key_id,
                aws_secret_access_key=settings.aws_secret_access_key,
                region_name=self.region_name,
            )
            return client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expiry,
            )

        loop = asyncio.get_event_loop()
        try:
            return await loop.run_in_executor(None, _presign)
        except (BotoCoreError, ClientError) as e:
            raise RuntimeError(f"Presign failed for '{key}': {e}") from e