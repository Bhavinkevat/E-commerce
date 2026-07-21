from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import (
    Base,
    engine,
    check_database_connection,
    ensure_product_image_column,
    ensure_user_role_column,
    ensure_user_profile_columns,
    ensure_user_otp_columns,
    ensure_default_admin,
)
from app.routers.admin import router as admin_router
from app.routers.cart import router as cart_router
from app.routers.order import router as order_router
from app.routers.product import router as product_router
from app.routers.user import router as user_router
from app.routers.wishlist import router as wishlist_router


app = FastAPI(title="Gahena API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    ensure_user_role_column()
    ensure_product_image_column()
    ensure_user_profile_columns()
    ensure_user_otp_columns()
    ensure_default_admin()


app.include_router(user_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(order_router)
app.include_router(admin_router)


@app.get("/")
def read_root():
    return {"message": "Gahena backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    check_database_connection()
    return {"database": "connected"}
