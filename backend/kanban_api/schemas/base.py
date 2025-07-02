from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    model_config = ConfigDict(
        extra="ignore",
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
        frozen=True,
        by_alias=True,
        validate_default=True,
        str_max_length=4096,
    )
