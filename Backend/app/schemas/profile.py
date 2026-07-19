from pydantic import BaseModel, EmailStr


class ProfileUpdate(BaseModel):
    name: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    password: str | None = None
