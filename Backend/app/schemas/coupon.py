from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CouponBase(BaseModel):
    code: str
    discount_type: str = "percentage"  # 'percentage' or 'flat'
    discount_value: float
    min_order_value: int = 0
    max_discount_amount: float | None = None
    is_active: bool = True


class CouponCreate(CouponBase):
    pass


class CouponRead(CouponBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class CouponApplyRequest(BaseModel):
    code: str
    cart_total: float


class CouponApplyResponse(BaseModel):
    valid: bool
    message: str
    code: str = ""
    discount_amount: float = 0.0
    final_total: float = 0.0
