from sqlalchemy.orm import Session

from app.models import CartItem, Product
from app.schemas.cart import CartAdd, CartUpdate


def list_cart_items(db: Session, user_id: int) -> list[CartItem]:
    return (
        db.query(CartItem)
        .filter(CartItem.user_id == user_id)
        .order_by(CartItem.id.desc())
        .all()
    )


def add_to_cart(db: Session, user_id: int, payload: CartAdd) -> CartItem:
    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == user_id, CartItem.product_id == payload.product_id)
        .first()
    )
    if item:
        item.quantity += max(payload.quantity, 1)
    else:
        item = CartItem(user_id=user_id, product_id=payload.product_id, quantity=max(payload.quantity, 1))
        db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_cart_item(db: Session, user_id: int, product_id: int, payload: CartUpdate) -> CartItem | None:
    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == user_id, CartItem.product_id == product_id)
        .first()
    )
    if not item:
        return None
    item.quantity = max(payload.quantity, 1)
    db.commit()
    db.refresh(item)
    return item


def remove_from_cart(db: Session, user_id: int, product_id: int) -> bool:
    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == user_id, CartItem.product_id == product_id)
        .first()
    )
    if not item:
        return False
    db.delete(item)
    db.commit()
    return True


def attach_cart_products(db: Session, items: list[CartItem]) -> list[dict]:
    product_ids = [item.product_id for item in items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    product_map = {product.id: product for product in products}

    result = []
    for item in items:
        result.append(
            {
                "id": item.id,
                "user_id": item.user_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "product": product_map.get(item.product_id),
            }
        )
    return result
