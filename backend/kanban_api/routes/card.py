from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from kanban_api.dependencies import get_card, get_current_user, get_db  # type: ignore
from kanban_api.models import Card
from kanban_api.schemas.card import CardInUpdate, CardOut
from kanban_api.utils.attr import update_attributes

router = APIRouter(prefix="/cards", tags=["cards"], dependencies=[Depends(get_current_user)])


@router.get("/{card_id}", status_code=200)
def get_card(card: Card = Depends(get_card)) -> CardOut:
    return card  # type: ignore


@router.patch("/{card_id}", status_code=200)
def update_card(
    card_update: CardInUpdate, card: Card = Depends(get_card), db: Session = Depends(get_db)
) -> CardOut:
    update_attributes(card, card_update.model_dump(exclude_unset=True, exclude={"labels"}))

    if card_update.labels:
        card.labels = [label for label in card.board.labels if label.color in card_update.labels]
    db.commit()
    db.refresh(card)
    return card  # type: ignore


@router.delete("/{card_id}", status_code=204)
def delete_card(card: Card = Depends(get_card), db: Session = Depends(get_db)):
    db.delete(card)
    db.commit()
