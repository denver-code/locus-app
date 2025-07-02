from typing import *

from pydantic import BaseModel, Field


class Body_login_api_auth_tokens_post(BaseModel):
    """
    Body_login_api_auth_tokens_post model

    """

    model_config = {"populate_by_name": True, "validate_assignment": True}

    grant_type: Optional[str] = Field(validation_alias="grant_type", default=None)

    username: str = Field(validation_alias="username")

    password: str = Field(validation_alias="password")

    scope: Optional[str] = Field(validation_alias="scope", default=None)

    client_id: Optional[str] = Field(validation_alias="client_id", default=None)

    client_secret: Optional[str] = Field(validation_alias="client_secret", default=None)
