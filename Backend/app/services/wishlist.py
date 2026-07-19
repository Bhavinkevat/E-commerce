from sqlalchemy.orm import Session

from app.models import Product, WishlistItem


def list_wishlist(db: Session, user_id: int) -> list[WishlistItem]:
    return (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user_id)
        .order_by(WishlistItem.id.desc())
        .all()
    )


def toggle_wishlist(db: Session, user_id: int, product_id: int) -> bool:
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
        .first()
    )
    if item:
        db.delete(item)
        db.commit()
        return False

    db.add(WishlistItem(user_id=user_id, product_id=product_id))
    db.commit()
    return True


def attach_wishlist_products(db: Session, items: list[WishlistItem]) -> list[dict]:
    product_ids = [item.product_id for item in items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    product_map = {product.id: product for product in products}

    return [
        {
            "id": item.id,
            "user_id": item.user_id,
            "product_id": item.product_id,
            "created_at": item.created_at,
            "product": product_map.get(item.product_id),
        }
        for item in items
    ]
