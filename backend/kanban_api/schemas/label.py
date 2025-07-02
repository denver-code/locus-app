from enum import Enum

from kanban_api.schemas.base import BaseSchema


class LabelColor(str, Enum):
    RED = "red"  # 🔴
    ORANGE = "orange"  # 🟠
    YELLOW = "yellow"  # 🟡
    GREEN = "green"  # 🟢
    BLUE = "blue"  # 🔵
    PURPLE = "purple"  # 🟣
    GRAY = "gray"  # ⚪


class LabelInCreate(BaseSchema):
    color: LabelColor
    name: str = ""


class LabelInUpdate(BaseSchema):
    color: LabelColor
    name: str | None = None


# Output models
class LabelOut(BaseSchema):
    color: LabelColor
    name: str
