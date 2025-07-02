from typing import *

from pydantic import BaseModel, Field


class UserInCreate(BaseModel):
    """
    UserInCreate model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    email: str = Field(validation_alias="email")

    password: str = Field(validation_alias="password")
