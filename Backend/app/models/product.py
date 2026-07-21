from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    description: Mapped[str] = mapped_column(LONGTEXT, nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    original_price: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    sizes: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    colors: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    gallery_images: Mapped[str] = mapped_column(LONGTEXT, nullable=False, server_default="")
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=5.0)
    status: Mapped[str] = mapped_column(String(20), nullable=False, server_default="Active")
    image_url: Mapped[str] = mapped_column(LONGTEXT, nullable=False, server_default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
