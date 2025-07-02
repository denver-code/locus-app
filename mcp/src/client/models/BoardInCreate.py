from typing import *

from pydantic import BaseModel, Field


class BoardInCreate(BaseModel):
    """
    BoardInCreate model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    title: str = Field(validation_alias="title")

    description: Optional[str] = Field(validation_alias="description", default=None)
