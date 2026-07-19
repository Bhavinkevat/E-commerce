from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    unit_price: int
    quantity: int
    line_total: int


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_no: str
    user_id: int
    customer_name: str | None = None
    total: int
    status: str
    shipping_address: str
    created_at: datetime
    items: list[OrderItemRead] = Field(default_factory=list)


class CheckoutPayload(BaseModel):
    shipping_address: str
