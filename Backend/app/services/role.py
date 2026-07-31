from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models import Role, RolePermission, User
from app.schemas.role import RoleCreate, RolePermissionsUpdatePayload, StaffUserCreate

ALL_MODULES = [
    "Products",
    "Coupons",
    "Orders",
    "Customers",
    "Analytics",
    "Role & Permissions",
]


def list_roles(db: Session) -> list[Role]:
    roles = db.query(Role).all()
    # Ensure every role has entries for all modules
    for role in roles:
        existing_modules = {p.module_name for p in role.permissions}
        for mod in ALL_MODULES:
            if mod not in existing_modules:
                is_admin = role.name.lower() in ["admin", "super admin"]
                perm = RolePermission(
                    role_id=role.id,
                    module_name=mod,
                    can_view=True,
                    can_create=is_admin,
                    can_update=is_admin,
                    can_delete=is_admin,
                )
                db.add(perm)
        db.commit()
        db.refresh(role)
    return roles


def create_role(db: Session, payload: RoleCreate) -> Role:
    role_name = payload.name.strip()
    existing = db.query(Role).filter(Role.name.ilike(role_name)).first()
    if existing:
        raise ValueError(f"Role '{role_name}' already exists.")

    role = Role(name=role_name, description=(payload.description or "").strip())
    db.add(role)
    db.commit()
    db.refresh(role)

    # Initialize default permissions for all modules
    is_admin = role.name.lower() in ["admin", "super admin"]
    for mod in ALL_MODULES:
        perm = RolePermission(
            role_id=role.id,
            module_name=mod,
            can_view=True,
            can_create=is_admin,
            can_update=is_admin,
            can_delete=is_admin,
        )
        db.add(perm)
    db.commit()
    db.refresh(role)
    return role



def update_role_permissions(db: Session, role_id: int, payload: RolePermissionsUpdatePayload) -> Role:
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise ValueError("Role not found")

    is_super_admin = role.name.lower() in ["admin", "super admin"]

    for item in payload.permissions:
        perm = db.query(RolePermission).filter(
            RolePermission.role_id == role_id,
            RolePermission.module_name == item.module_name,
        ).first()

        if not perm:
            perm = RolePermission(role_id=role_id, module_name=item.module_name)
            db.add(perm)

        if is_super_admin:
            perm.can_view = True
            perm.can_create = True
            perm.can_update = True
            perm.can_delete = True
        else:
            perm.can_view = item.can_view
            perm.can_create = item.can_create
            perm.can_update = item.can_update
            perm.can_delete = item.can_delete

    db.commit()
    db.refresh(role)
    return role


def list_staff_users(db: Session) -> list[User]:
    return db.query(User).filter(User.role != "user").all()


def create_staff_user(db: Session, payload: StaffUserCreate) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise ValueError("Email is already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_permissions(db: Session, user: User) -> dict[str, dict[str, bool]]:
    perm_map: dict[str, dict[str, bool]] = {}

    is_admin = user.role.lower() in ["admin", "super admin"]

    if is_admin:
        for mod in ALL_MODULES:
            perm_map[mod] = {"can_view": True, "can_create": True, "can_update": True, "can_delete": True}
        return perm_map

    # Query role permissions for user's assigned role
    role = db.query(Role).filter(Role.name.ilike(user.role.strip())).first()
    if not role:
        for mod in ALL_MODULES:
            perm_map[mod] = {"can_view": True, "can_create": True, "can_update": True, "can_delete": False}
        return perm_map

    for mod in ALL_MODULES:
        p = db.query(RolePermission).filter(
            RolePermission.role_id == role.id,
            RolePermission.module_name == mod,
        ).first()

        if p:
            perm_map[mod] = {
                "can_view": p.can_view,
                "can_create": p.can_create,
                "can_update": p.can_update,
                "can_delete": p.can_delete,
            }
        else:
            perm_map[mod] = {"can_view": True, "can_create": True, "can_update": True, "can_delete": False}

    return perm_map

