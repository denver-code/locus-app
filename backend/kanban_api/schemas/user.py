from datetime import datetime

from pydantic import EmailStr, SecretStr, computed_field

from kanban_api.schemas.base import BaseSchema
from kanban_api.utils import get_password_hash


# input models
class UserInCreate(BaseSchema):
    email: EmailStr
    password: SecretStr

    @computed_field
    @property
    def hashed_password(self) -> str:
        return get_password_hash(self.password.get_secret_value())


class UserInUpdate(BaseSchema):
    email: str | None = None
    password: SecretStr | None = None

    @computed_field
    @property
    def hashed_password(self) -> str | None:
        if self.password:
            return get_password_hash(self.password.get_secret_value())
        return None


class UserInSearch(BaseSchema):
    email: EmailStr


# output models
class UserOut(BaseSchema):
    id: int
    email: EmailStr
    created_at: datetime
    updated_at: datetime


class UserOutPublic(BaseSchema):
    id: int
    email: EmailStr
