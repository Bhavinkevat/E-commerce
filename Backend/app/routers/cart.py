from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.cart import CartAdd, CartItemRead, CartUpdate
from app.services.cart import add_to_cart, attach_cart_products, list_cart_items, remove_from_cart, update_cart_item
from app.services.product import get_product


router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("", response_model=list[CartItemRead])
def read_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return attach_cart_products(db, list_cart_items(db, current_user.id))


@router.post("", response_model=list[CartItemRead])
def add_cart_item(payload: CartAdd, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = get_product(db, payload.product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    add_to_cart(db, current_user.id, payload)
    return attach_cart_products(db, list_cart_items(db, current_user.id))


@router.put("/{product_id}", response_model=list[CartItemRead])
def change_cart_item(product_id: int, payload: CartUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    updated = update_cart_item(db, current_user.id, product_id, payload)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    return attach_cart_products(db, list_cart_items(db, current_user.id))


@router.delete("/{product_id}", response_model=list[CartItemRead])
def delete_cart_item(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    remove_from_cart(db, current_user.id, product_id)
    return attach_cart_products(db, list_cart_items(db, current_user.id))
