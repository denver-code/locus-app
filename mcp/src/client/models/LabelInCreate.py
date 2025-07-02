from typing import *

from pydantic import BaseModel, Field

from .LabelColor import LabelColor


class LabelInCreate(BaseModel):
    """
    LabelInCreate model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    color: LabelColor = Field(validation_alias="color")

    name: Optional[str] = Field(validation_alias="name", default=None)
