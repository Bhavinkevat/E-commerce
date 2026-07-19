from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import CartItem, Order, OrderItem, Product, User


def build_order_no(order_id: int) -> str:
    return f"ORD-{order_id:04d}"


def list_orders_for_user(db: Session, user_id: int) -> list[Order]:
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.id.desc()).all()


def list_orders_for_admin(db: Session) -> list[Order]:
    return db.query(Order).order_by(Order.id.desc()).all()


def create_order_from_cart(db: Session, user_id: int, shipping_address: str, product_id: int | None = None) -> Order | None:
    query = db.query(CartItem).filter(CartItem.user_id == user_id)
    if product_id is not None:
        query = query.filter(CartItem.product_id == product_id)
    cart_items = query.all()
    if not cart_items:
        return None

    product_ids = [item.product_id for item in cart_items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    product_map = {product.id: product for product in products}

    total = 0
    order = Order(
        order_no="TEMP",
        user_id=user_id,
        total=0,
        status="Pending",
        shipping_address=shipping_address,
    )
    db.add(order)
    db.flush()

    order.order_no = build_order_no(order.id)

    for cart_item in cart_items:
        product = product_map.get(cart_item.product_id)
        if not product:
            continue
        line_total = product.price * cart_item.quantity
        total += line_total
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=cart_item.quantity,
                line_total=line_total,
            )
        )
        if product.stock is not None:
            product.stock = max(product.stock - cart_item.quantity, 0)

    order.total = total
    
    # Delete only the ordered items from the cart
    delete_query = db.query(CartItem).filter(CartItem.user_id == user_id)
    if product_id is not None:
        delete_query = delete_query.filter(CartItem.product_id == product_id)
    delete_query.delete()
    
    db.commit()
    db.refresh(order)
    return order


def attach_order_items(db: Session, orders: list[Order]) -> list[dict]:
    order_ids = [order.id for order in orders]
    items = db.query(OrderItem).filter(OrderItem.order_id.in_(order_ids)).all()
    items_by_order: dict[int, list[OrderItem]] = {}
    for item in items:
        items_by_order.setdefault(item.order_id, []).append(item)

    user_ids = [order.user_id for order in orders]
    users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []
    user_map = {user.id: user for user in users}

    return [
        {
            "id": order.id,
            "order_no": order.order_no,
            "user_id": order.user_id,
            "customer_name": user_map.get(order.user_id).name if user_map.get(order.user_id) else None,
            "total": order.total,
            "status": order.status,
            "shipping_address": order.shipping_address,
            "created_at": order.created_at,
            "items": items_by_order.get(order.id, []),
        }
        for order in orders
    ]


def update_order_status(db: Session, order_id: int, status: str) -> Order | None:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    order.status = status
    db.commit()
    db.refresh(order)
    return order

