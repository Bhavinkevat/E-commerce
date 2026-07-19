from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import User
from app.schemas.profile import ProfileUpdate


def update_profile(db: Session, user: User, payload: ProfileUpdate) -> User:
    data = payload.model_dump(exclude_unset=True)
    if "password" in data:
        user.hashed_password = hash_password(data.pop("password"))
    for key, value in data.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
