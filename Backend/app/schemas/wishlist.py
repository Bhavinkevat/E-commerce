from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.product import ProductRead


class WishlistToggle(BaseModel):
    product_id: int


class WishlistItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    product_id: int
    created_at: datetime
    product: ProductRead | None = None
