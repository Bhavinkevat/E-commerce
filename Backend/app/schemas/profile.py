from pydantic import BaseModel, EmailStr


class ProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
