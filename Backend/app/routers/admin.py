from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.database import get_db
from app.schemas.admin import AnalyticsMetric, CustomerSummary, DashboardResponse, UpdateOrderStatusPayload
from app.schemas.order import OrderRead
from app.services.admin import build_analytics, build_customer_summaries, build_dashboard_cards
from app.services.order import attach_order_items, list_orders_for_admin, update_order_status


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/overview", response_model=DashboardResponse, dependencies=[Depends(require_roles("admin"))])
def overview(db: Session = Depends(get_db)):
    return {"cards": build_dashboard_cards(db)}


@router.get("/analytics", response_model=list[AnalyticsMetric], dependencies=[Depends(require_roles("admin"))])
def analytics(db: Session = Depends(get_db)):
    return build_analytics(db)


@router.get("/customers", response_model=list[CustomerSummary], dependencies=[Depends(require_roles("admin"))])
def customers(db: Session = Depends(get_db)):
    return build_customer_summaries(db)


@router.get("/orders", response_model=list[OrderRead], dependencies=[Depends(require_roles("admin"))])
def orders(db: Session = Depends(get_db)):
    return attach_order_items(db, list_orders_for_admin(db))


@router.put("/orders/{order_id}/status", response_model=OrderRead, dependencies=[Depends(require_roles("admin"))])
def update_order_status_route(
    order_id: int,
    payload: UpdateOrderStatusPayload,
    db: Session = Depends(get_db),
):
    order = update_order_status(db, order_id, payload.status)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return attach_order_items(db, [order])[0]

