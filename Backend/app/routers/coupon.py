from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.database import get_db
from app.models.coupon import Coupon
from app.schemas.coupon import (
    CouponApplyRequest,
    CouponApplyResponse,
    CouponCreate,
    CouponRead,
)

router = APIRouter(prefix="/coupons", tags=["Coupons"])


@router.get("/active", response_model=list[CouponRead])
def list_active_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).filter(Coupon.is_active == True).all()


@router.post("/apply", response_model=CouponApplyResponse)
def apply_coupon(payload: CouponApplyRequest, db: Session = Depends(get_db)):
    code_upper = payload.code.strip().upper()
    coupon = (
        db.query(Coupon)
        .filter(Coupon.code == code_upper, Coupon.is_active == True)
        .first()
    )

    if not coupon:
        return CouponApplyResponse(
            valid=False,
            message="Invalid or expired coupon code.",
            cart_total=payload.cart_total,
            final_total=payload.cart_total,
        )

    if payload.cart_total < coupon.min_order_value:
        return CouponApplyResponse(
            valid=False,
            message=f"Coupon require a minimum purchase of ₹{coupon.min_order_value}.",
            cart_total=payload.cart_total,
            final_total=payload.cart_total,
        )

    discount = 0.0
    if coupon.discount_type == "percentage":
        discount = (payload.cart_total * coupon.discount_value) / 100.0
        if coupon.max_discount_amount and discount > coupon.max_discount_amount:
            discount = coupon.max_discount_amount
    else:  # flat
        discount = float(coupon.discount_value)

    discount = min(discount, payload.cart_total)
    final_total = max(0.0, payload.cart_total - discount)

    return CouponApplyResponse(
        valid=True,
        message=f"Coupon '{coupon.code}' applied successfully!",
        code=coupon.code,
        discount_amount=round(discount, 2),
        final_total=round(final_total, 2),
    )


@router.get("/admin", response_model=list[CouponRead], dependencies=[Depends(require_roles("admin"))])
def admin_list_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).all()


@router.post("/admin", response_model=CouponRead, dependencies=[Depends(require_roles("admin"))])
def admin_create_coupon(payload: CouponCreate, db: Session = Depends(get_db)):
    existing = db.query(Coupon).filter(Coupon.code == payload.code.upper()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code already exists.",
        )

    new_coupon = Coupon(
        code=payload.code.strip().upper(),
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        min_order_value=payload.min_order_value,
        max_discount_amount=payload.max_discount_amount,
        is_active=payload.is_active,
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon


@router.delete("/admin/{coupon_id}", dependencies=[Depends(require_roles("admin"))])
def admin_delete_coupon(coupon_id: int, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    return {"success": True}
