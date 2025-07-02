from typing import *

from pydantic import BaseModel, Field


class UserInSearch(BaseModel):
    """
    UserInSearch model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    email: str = Field(validation_alias="email")
