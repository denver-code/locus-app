from typing import *

from pydantic import BaseModel, Field

from .LabelInUpdate import LabelInUpdate


class BoardInUpdate(BaseModel):
    """
    BoardInUpdate model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    title: Optional[str] = Field(validation_alias="title", default=None)

    description: Optional[str] = Field(validation_alias="description", default=None)

    labels: Optional[List[Optional[LabelInUpdate]]] = Field(validation_alias="labels", default=None)
