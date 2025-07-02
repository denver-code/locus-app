from typing import *

from pydantic import BaseModel, Field

from .LabelOut import LabelOut


class BoardOut(BaseModel):
    """
    BoardOut model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    id: int = Field(validation_alias="id")

    title: str = Field(validation_alias="title")

    labels: List[LabelOut] = Field(validation_alias="labels")

    description: str = Field(validation_alias="description")

    createdAt: str = Field(validation_alias="createdAt")

    updatedAt: str = Field(validation_alias="updatedAt")
