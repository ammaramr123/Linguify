from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"  # ✅ ignores DB_HOST, REDIS_HOST, AES_SECRET_KEY etc
    )

    # SHARED
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str
    s3_bucket_name: str
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str

    # FASTAPI ONLY
    redis_url: str
    job_stream: str
    result_stream: str
    dead_letter_stream: str
    roboflow_api_key: str
    roboflow_workspace: str
    roboflow_workflow_id: str
    ocr_api_url: str
    ocr_api_token: str
    cdn_strategy: str = "s3"
    s3_base_prefix: Optional[str] = "translated-images"
    s3_region_name: Optional[str] = "eu-north-1"
    detection_strategy: str = "RoboflowDetection"
    ocr_strategy: str = "PaddleOCR"
    translation_strategy: str = "Naive"
    broker_strategy: str = "redis"

settings = Settings()