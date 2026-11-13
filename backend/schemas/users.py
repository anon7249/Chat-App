from datetime import datetime
from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }  # from attributes lets pydantic read fields from sqlalchemy users object, anything not listed here like password hash is dropped
    # from the response


class UserSearchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
