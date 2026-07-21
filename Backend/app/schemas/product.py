from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    name: str
    category: str
    description: str
    price: int
    original_price: int | None = 0
    sizes: str | None = ""
    colors: str | None = ""
    gallery_images: str | None = ""
    stock: int = 0
    rating: float = 5.0
    status: str = "Active"
    image_url: str | None = ""


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    description: str | None = None
    price: int | None = None
    original_price: int | None = None
    sizes: str | None = None
    colors: str | None = None
    gallery_images: str | None = None
    stock: int | None = None
    rating: float | None = None
    status: str | None = None
    image_url: str | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
