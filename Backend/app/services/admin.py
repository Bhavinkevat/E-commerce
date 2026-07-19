from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Order, Product, User


def build_dashboard_cards(db: Session) -> list[dict[str, str]]:
    product_count = db.query(Product).count()
    active_products = db.query(Product).filter(Product.status == "Active").count()
    low_stock = db.query(Product).filter(Product.stock < 15).count()
    order_count = db.query(Order).count()
    paid_orders = db.query(Order).filter(Order.status == "Paid").count()
    revenue = db.query(func.coalesce(func.sum(Order.total), 0)).scalar() or 0

    return [
        {"label": "Revenue", "value": f"Rs. {int(revenue):,}"},
        {"label": "Products", "value": str(product_count)},
        {"label": "Active", "value": str(active_products)},
        {"label": "Low Stock", "value": str(low_stock)},
        {"label": "Orders", "value": str(order_count)},
        {"label": "Paid", "value": str(paid_orders)},
    ]


def build_analytics(db: Session) -> list[dict[str, str]]:
    total_orders = db.query(Order).count() or 1
    paid_orders = db.query(Order).filter(Order.status == "Paid").count()
    delivered_orders = db.query(Order).filter(Order.status == "Delivered").count()
    repeat_buyers = (
        db.query(Order.user_id)
        .group_by(Order.user_id)
        .having(func.count(Order.id) > 1)
        .count()
    )
    revenue = db.query(func.coalesce(func.sum(Order.total), 0)).scalar() or 0

    return [
        {"label": "Conversion", "value": f"{(paid_orders / total_orders) * 100:.1f}%"},
        {"label": "Return Rate", "value": f"{max(0.0, 100 - (delivered_orders / total_orders) * 100):.1f}%"},
        {"label": "Avg. Order", "value": f"Rs. {int(revenue / total_orders):,}"},
        {"label": "Repeat Buyers", "value": f"{repeat_buyers}%"},
    ]


def build_customer_summaries(db: Session) -> list[dict]:
    orders = db.query(Order).all()
    totals: dict[int, dict[str, int]] = {}
    for order in orders:
        bucket = totals.setdefault(order.user_id, {"orders": 0, "spent": 0})
        bucket["orders"] += 1
        bucket["spent"] += order.total

    users = db.query(User).order_by(User.id.desc()).all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "orders": totals.get(user.id, {}).get("orders", 0),
            "spent": totals.get(user.id, {}).get("spent", 0),
            "status": "Active" if user.role else "Blocked",
        }
        for user in users
    ]
