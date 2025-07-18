from datetime import datetime

from pydantic import computed_field

from locus_api.schemas.base import BaseSchema
from locus_api.schemas.label import LabelColor, LabelInCreate, LabelInUpdate, LabelOut


# Input models
class BoardInCreate(BaseSchema):
    title: str
    acronym: str
    description: str = ""

    @computed_field
    @property
    def labels(self) -> list[LabelInCreate]:
        return [LabelInCreate(color=color) for color in LabelColor]


class BoardInUpdate(BaseSchema):
    title: str | None = None
    acronym: str | None = None
    description: str | None = None
    labels: list[LabelInUpdate] | None = None


# Output models
class BoardOut(BaseSchema):
    id: int
    title: str
    acronym: str
    labels: list[LabelOut]
    description: str
    created_at: datetime
    updated_at: datetime
