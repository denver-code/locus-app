import time
from datetime import datetime, timedelta, timezone

import pytest
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from kanban_api.schemas.token import TokenData
from kanban_api.utils import create_access_token, decode_access_token


def test_create_access_token_returns_string():
    token_data = TokenData(sub="1", email="test@example.com")
    token = create_access_token(token_data)
    assert isinstance(token, str)


def test_decode_access_token_returns_token_data():
    token_data = TokenData(sub="1", email="test@example.com")
    token = create_access_token(token_data)
    decoded = decode_access_token(token)
    assert isinstance(decoded, TokenData)
    assert decoded is not None


def test_expires_delta_one_hour_passes():
    token_data = TokenData(sub="1", email="test@example.com")
    token = create_access_token(token_data, expires_delta=timedelta(hours=1))
    decoded = decode_access_token(token)
    assert decoded is not None
    assert "exp" in decoded.model_dump()


def test_expires_delta_one_microsecond_fails():
    token_data = TokenData(sub="1", email="test@example.com")
    token = create_access_token(token_data, expires_delta=timedelta(milliseconds=1))
    time.sleep(0.05)
    with pytest.raises(ExpiredSignatureError):
        decode_access_token(token)


def test_token_data_integrity():
    token_data = TokenData(
        sub="1", email="test@example.com", exp=datetime.now(timezone.utc) + timedelta(hours=1)
    )
    token = create_access_token(token_data)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.sub == token_data.sub
    assert decoded.email == token_data.email
    assert abs((decoded.exp - token_data.exp).total_seconds()) < 1  # type: ignore

    token = create_access_token(token_data, expires_delta=timedelta(days=1))
    decoded = decode_access_token(token)
    # test all fields are the same except for exp
    assert decoded is not None
    assert decoded.sub == token_data.sub
    assert decoded.email == token_data.email
    assert decoded.exp != token_data.exp


def test_tampered_token_raises_invalid_token_error():
    token_data = TokenData(sub="1", email="test@example.com")
    token = create_access_token(token_data)
    tampered_token = token[:-1] + ("1" if token[-1] == "0" else "0")

    with pytest.raises(InvalidTokenError):
        decode_access_token(tampered_token)
