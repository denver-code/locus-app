from datetime import datetime, timedelta, timezone

import jwt

from kanban_api.config import settings
from kanban_api.schemas.token import TokenData


def create_access_token(data: TokenData, expires_delta: timedelta | None = None) -> str:
    to_encode = data.model_dump(exclude_unset=True, exclude_none=True)
    if expires_delta:
        to_encode.update({"exp": datetime.now(timezone.utc) + expires_delta})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def decode_access_token(token: str) -> TokenData | None:
    decoded = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])  # type: ignore
    if decoded.get("sub") is None:
        return None
    return TokenData(**decoded)
