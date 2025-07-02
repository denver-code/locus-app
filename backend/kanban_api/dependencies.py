from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from kanban_api.database import SessionLocal
from kanban_api.models import Board, Card, User, UserBoard
from kanban_api.utils import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/tokens")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        token_data = decode_access_token(token)
        if not token_data:
            # Token is invalid
            raise InvalidTokenError

        stmt = select(User).where(User.id == int(token_data.sub))
        user = db.execute(stmt).scalar_one_or_none()

        if not user:
            # Token sub is not a valid user id
            raise InvalidTokenError

        return user
    except InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_board(
    board_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Board:
    stmt = select(Board).where(Board.id == board_id, Board.owners.contains(current_user))
    board = db.execute(stmt).scalar_one_or_none()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found or user is not owner")
    return board


def get_user(user_id: int, db: Session = Depends(get_db)) -> User:
    stmt = select(User).where(User.id == user_id)
    user = db.execute(stmt).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_card(
    card_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> Card:
    stmt = (
        select(Card)
        .join(Board)
        .join(UserBoard)
        .where(Card.id == card_id, UserBoard.user_id == current_user.id)
    )
    card = db.execute(stmt).scalar_one_or_none()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found or user is not owner")

    return card
