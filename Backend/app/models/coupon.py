from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    discount_type: Mapped[str] = mapped_column(String(20), nullable=False, default="percentage")  # 'percentage' or 'flat'
    discount_value: Mapped[float] = mapped_column(Float, nullable=False)
    min_order_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_discount_amount: Mapped[float] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
