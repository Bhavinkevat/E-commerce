from app.schemas.admin import AnalyticsMetric, CustomerSummary, DashboardCard, DashboardResponse
from app.schemas.auth import TokenResponse, UserCreate, UserLogin, UserRead
from app.schemas.cart import CartAdd, CartItemRead, CartUpdate
from app.schemas.order import CheckoutPayload, OrderItemRead, OrderRead
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.profile import ProfileUpdate
from app.schemas.wishlist import WishlistItemRead, WishlistToggle

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserRead",
    "TokenResponse",
    "ProductCreate",
    "ProductRead",
    "ProductUpdate",
    "CartAdd",
    "CartItemRead",
    "CartUpdate",
    "WishlistToggle",
    "WishlistItemRead",
    "OrderRead",
    "OrderItemRead",
    "CheckoutPayload",
    "DashboardCard",
    "DashboardResponse",
    "AnalyticsMetric",
    "CustomerSummary",
    "ProfileUpdate",
]
