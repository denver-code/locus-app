from typing import *

from pydantic import BaseModel, Field

from .CardColumn import CardColumn
from .LabelColor import LabelColor


class CardOut(BaseModel):
    """
    CardOut model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    id: int = Field(validation_alias="id")

    title: str = Field(validation_alias="title")

    description: str = Field(validation_alias="description")

    boardId: int = Field(validation_alias="boardId")

    column: CardColumn = Field(validation_alias="column")

    labels: List[LabelColor] = Field(validation_alias="labels")

    createdAt: str = Field(validation_alias="createdAt")

    updatedAt: str = Field(validation_alias="updatedAt")
