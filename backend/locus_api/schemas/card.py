from datetime import datetime
from enum import Enum

from pydantic import field_validator

from locus_api.schemas.base import BaseSchema
from locus_api.schemas.label import LabelColor


# ToDo: Make it more modular and move to a separate file
class CardColumn(str, Enum):
    BACKLOG = "BACKLOG"
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"


# Input models
class CardInCreate(BaseSchema):
    title: str
    description: str = ""
    column: CardColumn = CardColumn.BACKLOG
    labels: list[LabelColor] = []


class CardInUpdate(BaseSchema):
    title: str | None = None
    description: str | None = None
    column: CardColumn | None = None
    labels: list[LabelColor] | None = None


# Output models
class CardOut(BaseSchema):
    id: int
    title: str
    description: str
    board_id: int
    column: CardColumn
    labels: list[LabelColor]
    created_at: datetime
    updated_at: datetime

    # Extract color from lables
    @field_validator("labels", mode="before")
    def extract_labels(cls, v):
        return [label.color for label in v]
