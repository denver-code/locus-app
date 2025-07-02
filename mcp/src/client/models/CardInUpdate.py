from typing import *

from pydantic import BaseModel, Field

from .CardColumn import CardColumn
from .LabelColor import LabelColor


class CardInUpdate(BaseModel):
    """
    CardInUpdate model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    title: Optional[str] = Field(validation_alias="title", default=None)

    description: Optional[str] = Field(validation_alias="description", default=None)

    column: Optional[CardColumn] = Field(validation_alias="column", default=None)

    labels: Optional[List[Optional[LabelColor]]] = Field(validation_alias="labels", default=None)
