from typing import *

from pydantic import BaseModel, Field

from .LabelColor import LabelColor


class LabelOut(BaseModel):
    """
    LabelOut model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    color: LabelColor = Field(validation_alias="color")

    name: str = Field(validation_alias="name")
