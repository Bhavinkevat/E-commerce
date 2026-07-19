from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.wishlist import WishlistItemRead, WishlistToggle
from app.services.product import get_product
from app.services.wishlist import attach_wishlist_products, list_wishlist, toggle_wishlist


router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("", response_model=list[WishlistItemRead])
def read_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return attach_wishlist_products(db, list_wishlist(db, current_user.id))


@router.post("/toggle", response_model=list[WishlistItemRead])
def toggle_wishlist_route(payload: WishlistToggle, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = get_product(db, payload.product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    toggle_wishlist(db, current_user.id, payload.product_id)
    return attach_wishlist_products(db, list_wishlist(db, current_user.id))
