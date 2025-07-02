from typing import *

from pydantic import BaseModel, Field


class Token(BaseModel):
    """
    Token model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    access_token: str = Field(validation_alias="access_token")

    token_type: str = Field(validation_alias="token_type")
