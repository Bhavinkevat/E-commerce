from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.database import get_db
from app.schemas.role import (
    RoleCreate,
    RolePermissionsUpdatePayload,
    RoleRead,
    StaffUserCreate,
    StaffUserRead,
)
from app.services.role import (
    create_role,
    create_staff_user,
    list_roles,
    list_staff_users,
    update_role_permissions,
)

router = APIRouter(prefix="/admin/roles", tags=["Admin Roles"])


@router.get("", response_model=list[RoleRead], dependencies=[Depends(require_roles("admin"))])
def read_roles_route(db: Session = Depends(get_db)):
    return list_roles(db)


@router.post("", response_model=RoleRead, dependencies=[Depends(require_roles("admin"))])
def create_role_route(payload: RoleCreate, db: Session = Depends(get_db)):
    try:
        return create_role(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))



@router.put("/{role_id}/permissions", response_model=RoleRead, dependencies=[Depends(require_roles("admin"))])
def update_permissions_route(
    role_id: int, payload: RolePermissionsUpdatePayload, db: Session = Depends(get_db)
):
    try:
        return update_role_permissions(db, role_id, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/staff", response_model=list[StaffUserRead], dependencies=[Depends(require_roles("admin"))])
def read_staff_users_route(db: Session = Depends(get_db)):
    return list_staff_users(db)


@router.post("/staff", response_model=StaffUserRead, dependencies=[Depends(require_roles("admin"))])
def create_staff_user_route(payload: StaffUserCreate, db: Session = Depends(get_db)):
    try:
        return create_staff_user(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
