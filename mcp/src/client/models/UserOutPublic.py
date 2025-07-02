from typing import *

from pydantic import BaseModel, Field


class UserOutPublic(BaseModel):
    """
    UserOutPublic model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    id: int = Field(validation_alias="id")

    email: str = Field(validation_alias="email")
