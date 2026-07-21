from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


def ensure_database_exists() -> None:
    admin_url = URL.create(
        drivername="mysql+pymysql",
        username=settings.db_user,
        password=settings.db_password or None,
        host=settings.db_host,
        port=settings.db_port,
        database="mysql",
    )
    admin_engine = create_engine(admin_url, pool_pre_ping=True)

    quoted_name = settings.db_name.replace("`", "``")
    with admin_engine.connect() as connection:
        connection.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{quoted_name}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )

    admin_engine.dispose()


ensure_database_exists()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> bool:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return True


def ensure_user_role_column() -> None:
    inspector = inspect(engine)
    columns = [column["name"] for column in inspector.get_columns("users")]

    if "role" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text(
                    "ALTER TABLE users "
                    "ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' "
                    "AFTER hashed_password"
                )
            )

    with engine.begin() as connection:
        connection.execute(
            text("UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''")
        )


def ensure_product_image_column() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("products"):
        return

    columns = [column["name"] for column in inspector.get_columns("products")]
    if "image_url" not in columns:
        with engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE products ADD COLUMN image_url LONGTEXT NULL AFTER status")
            )
            connection.execute(text("UPDATE products SET image_url = '' WHERE image_url IS NULL"))
    else:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE products MODIFY COLUMN image_url LONGTEXT NULL"))


def ensure_user_profile_columns() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    columns = [column["name"] for column in inspector.get_columns("users")]
    new_cols = {
        "first_name": "ALTER TABLE users ADD COLUMN first_name VARCHAR(120) NULL AFTER name",
        "last_name": "ALTER TABLE users ADD COLUMN last_name VARCHAR(120) NULL AFTER first_name",
        "phone": "ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER email",
        "address": "ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL AFTER phone",
    }

    for col_name, sql in new_cols.items():
        if col_name not in columns:
            with engine.begin() as connection:
                connection.execute(text(sql))


def ensure_user_otp_columns() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("users"):
        return

    columns = [column["name"] for column in inspector.get_columns("users")]
    new_cols = {
        "reset_otp": "ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6) NULL AFTER role",
        "reset_otp_expires_at": "ALTER TABLE users ADD COLUMN reset_otp_expires_at DATETIME NULL AFTER reset_otp",
    }

    for col_name, sql in new_cols.items():
        if col_name not in columns:
            with engine.begin() as connection:
                connection.execute(text(sql))


def ensure_product_extra_columns() -> None:
    inspector = inspect(engine)
    if not inspector.has_table("products"):
        return

    columns = [column["name"] for column in inspector.get_columns("products")]
    new_cols = {
        "original_price": "ALTER TABLE products ADD COLUMN original_price INT NOT NULL DEFAULT 0 AFTER price",
        "sizes": "ALTER TABLE products ADD COLUMN sizes TEXT NULL AFTER original_price",
        "colors": "ALTER TABLE products ADD COLUMN colors TEXT NULL AFTER sizes",
        "gallery_images": "ALTER TABLE products ADD COLUMN gallery_images LONGTEXT NULL AFTER colors",
    }

    for col_name, sql in new_cols.items():
        if col_name not in columns:
            with engine.begin() as connection:
                connection.execute(text(sql))

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE products MODIFY COLUMN description LONGTEXT NULL"))
        connection.execute(text("ALTER TABLE products MODIFY COLUMN gallery_images LONGTEXT NULL"))
        connection.execute(text("UPDATE products SET original_price = 0 WHERE original_price IS NULL"))
        connection.execute(text("UPDATE products SET sizes = '' WHERE sizes IS NULL"))
        connection.execute(text("UPDATE products SET colors = '' WHERE colors IS NULL"))
        connection.execute(text("UPDATE products SET gallery_images = '' WHERE gallery_images IS NULL"))


def ensure_default_coupons() -> None:
    db = SessionLocal()
    try:
        count = db.execute(text("SELECT COUNT(*) FROM coupons")).scalar()
        if count == 0:
            db.execute(
                text(
                    "INSERT INTO coupons (code, discount_type, discount_value, min_order_value, is_active) "
                    "VALUES "
                    "('WELCOME25', 'percentage', 25, 499, 1), "
                    "('FESTIVE100', 'flat', 100, 999, 1), "
                    "('GAHENA10', 'percentage', 10, 0, 1)"
                )
            )
            db.commit()
            print("Default Coupons Initialized.")
    except Exception as e:
        print(f"Coupon seed note: {e}")
    finally:
        db.close()


def ensure_default_admin() -> None:
    from app.core.security import hash_password
    db = SessionLocal()
    try:
        admin = db.execute(text("SELECT id FROM users WHERE role = 'admin' LIMIT 1")).first()
        if not admin:
            db.execute(
                text(
                    "INSERT INTO users (name, email, hashed_password, role) "
                    "VALUES (:name, :email, :password, :role)"
                ),
                {
                    "name": "Gahena Admin",
                    "email": "admin@yopmail.com",
                    "password": hash_password("admin123"),
                    "role": "admin",
                },
            )
            db.commit()
            print("Single Admin account initialized: admin@yopmail.com")
    except Exception as e:
        print(f"Admin seed note: {e}")
    finally:
        db.close()

