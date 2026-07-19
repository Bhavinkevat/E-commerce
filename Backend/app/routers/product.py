from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import require_roles
from app.database import get_db
from app.models import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services.product import create_product, delete_product, get_product, list_products, update_product


router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductRead])
def read_products(db: Session = Depends(get_db)):
    return list_products(db)


@router.get("/{product_id}", response_model=ProductRead)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.post("", response_model=ProductRead, dependencies=[Depends(require_roles("admin"))])
def create_product_route(payload: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, payload)


@router.put("/{product_id}", response_model=ProductRead, dependencies=[Depends(require_roles("admin"))])
def update_product_route(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return update_product(db, product, payload)


@router.delete("/{product_id}", dependencies=[Depends(require_roles("admin"))])
def delete_product_route(product_id: int, db: Session = Depends(get_db)):
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    delete_product(db, product)
    return {"success": True}
