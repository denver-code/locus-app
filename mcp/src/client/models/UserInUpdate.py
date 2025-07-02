from typing import *

from pydantic import BaseModel, Field


class UserInUpdate(BaseModel):
    """
    UserInUpdate model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    email: Optional[str] = Field(validation_alias="email", default=None)

    password: Optional[str] = Field(validation_alias="password", default=None)
