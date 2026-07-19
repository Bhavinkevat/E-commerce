from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    category: str
    description: str
    price: int
    stock: int = 0
    rating: float = 5.0
    status: str = "Active"
    image_url: str = ""


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None
    price: int | None = None
    stock: int | None = None
    rating: int | None = None
    status: str | None = None
    image_url: str | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
