from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from kanban_api.dependencies import get_board, get_current_user, get_db, get_user  # type: ignore
from kanban_api.models import Board, Card, Label, User, UserBoard
from kanban_api.schemas.board import BoardInCreate, BoardInUpdate, BoardOut
from kanban_api.schemas.card import CardInCreate, CardOut
from kanban_api.schemas.user import UserOutPublic
from kanban_api.utils.attr import update_attributes

router = APIRouter(prefix="/boards", tags=["boards"], dependencies=[Depends(get_current_user)])


@router.get("", status_code=200)
def list_boards(current_user: User = Depends(get_current_user)) -> list[BoardOut]:
    return current_user.boards  # type: ignore


@router.post("", status_code=201)
def create_board(
    board_create: BoardInCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BoardOut:
    board = Board(**board_create.model_dump(exclude={"labels"}), owners=[current_user])
    board.labels = [Label(**label.model_dump()) for label in board_create.labels]
    db.add(board)
    db.commit()
    db.refresh(board)
    return board  # type: ignore


@router.get("/{board_id}", status_code=200)
def get_board(board: Board = Depends(get_board)) -> BoardOut:
    return board  # type: ignore


@router.delete("/{board_id}", status_code=204)
def delete_board(board: Board = Depends(get_board), db: Session = Depends(get_db)):
    db.delete(board)
    db.commit()


@router.patch("/{board_id}", status_code=200)
def update_board(
    board_update: BoardInUpdate, board: Board = Depends(get_board), db: Session = Depends(get_db)
) -> BoardOut:
    update_attributes(board, board_update.model_dump(exclude_unset=True, exclude={"labels"}))

    if board_update.labels:
        labels_update = {label_update.color: label_update for label_update in board_update.labels}
        for label in board.labels:
            if label.color in labels_update:
                update_attributes(label, labels_update[label.color].model_dump(exclude_unset=True))

    db.commit()
    db.refresh(board)
    return board  # type: ignore


@router.post("/{board_id}/cards", status_code=201, dependencies=[Depends(get_board)])
def create_cards(
    board_id: int, cards_create: list[CardInCreate], db: Session = Depends(get_db)
) -> list[CardOut]:
    cards = [{**card_create.model_dump(), "board_id": board_id} for card_create in cards_create]
    result = db.execute(insert(Card).returning(Card), cards).scalars()
    db.commit()
    return result  # type: ignore


@router.get("/{board_id}/cards", status_code=200)
def list_cards(board: Board = Depends(get_board)) -> list[CardOut]:
    return board.cards  # type: ignore


@router.put("/{board_id}/users/{user_id}", status_code=200)
def share_board(
    user: User = Depends(get_user), board: Board = Depends(get_board), db: Session = Depends(get_db)
):
    stmt = select(UserBoard).where(UserBoard.user_id == user.id, UserBoard.board_id == board.id)
    user_board = db.execute(stmt).scalar_one_or_none()

    if not user_board:
        db.add(UserBoard(user_id=user.id, board_id=board.id))
        db.commit()


@router.delete("/{board_id}/users/{user_id}", status_code=204)
def unshare_board(
    user: User = Depends(get_user), board: Board = Depends(get_board), db: Session = Depends(get_db)
):
    stmt = select(UserBoard).where(UserBoard.user_id == user.id, UserBoard.board_id == board.id)
    user_board = db.execute(stmt).scalar_one_or_none()

    if user_board:
        db.delete(user_board)
        db.commit()
    else:
        raise HTTPException(status_code=404, detail="User board association not found")


@router.get("/{board_id}/users", status_code=200)
def list_users(board: Board = Depends(get_board)) -> list[UserOutPublic]:
    return board.owners  # type: ignore
