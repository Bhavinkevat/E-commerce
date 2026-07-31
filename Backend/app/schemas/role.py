from datetime import datetime
from pydantic import BaseModel, EmailStr


class PermissionBase(BaseModel):
    module_name: str
    can_view: bool = True
    can_create: bool = False
    can_update: bool = False
    can_delete: bool = False


class PermissionRead(PermissionBase):
    id: int
    role_id: int

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    pass


class RoleRead(RoleBase):
    id: int
    created_at: datetime
    permissions: list[PermissionRead] = []

    class Config:
        from_attributes = True


class PermissionUpdateItem(BaseModel):
    module_name: str
    can_view: bool
    can_create: bool
    can_update: bool
    can_delete: bool


class RolePermissionsUpdatePayload(BaseModel):
    permissions: list[PermissionUpdateItem]


class StaffUserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role_name: str


class StaffUserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
