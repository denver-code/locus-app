from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from kanban_api.dependencies import get_db
from kanban_api.models import User
from kanban_api.schemas.token import Token, TokenData
from kanban_api.utils import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/tokens", status_code=200)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Token:
    stmt = select(User).where(User.email == form_data.username)
    user = db.execute(stmt).scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = TokenData(sub=str(user.id), email=user.email)
    access_token = create_access_token(token_data, expires_delta=timedelta(hours=1))

    return Token(access_token=access_token, token_type="bearer")
