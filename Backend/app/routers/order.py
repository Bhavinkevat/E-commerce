from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.order import CheckoutPayload, OrderRead
from app.services.order import attach_order_items, create_order_from_cart, list_orders_for_admin, list_orders_for_user


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[OrderRead])
def read_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = list_orders_for_admin(db) if current_user.role == "admin" else list_orders_for_user(db, current_user.id)
    return attach_order_items(db, orders)


@router.post("/checkout", response_model=OrderRead)
def checkout(payload: CheckoutPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = create_order_from_cart(db, current_user.id, payload.shipping_address)
    if not order:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")
    return attach_order_items(db, [order])[0]
