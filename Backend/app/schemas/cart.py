from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductRead


class CartAdd(BaseModel):
    product_id: int
    quantity: int = 1


class CartUpdate(BaseModel):
    quantity: int


class CartItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int
    quantity: int
    created_at: datetime
    updated_at: datetime
    product: ProductRead | None = None
