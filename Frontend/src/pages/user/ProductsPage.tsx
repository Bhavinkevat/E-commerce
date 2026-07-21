import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { listProducts, toggleWishlist, getWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    void listProducts().then(setProducts);
    void getWishlist().then(setWishlist);
  }, []);

  const isWishlisted = (productId: number) => {
    return wishlist.some((item) => item.id === productId);
  };

  const handleToggleWishlist = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.stopPropagation();
    try {
      const updatedWishlist = await toggleWishlist(productId);
      const isAdded = updatedWishlist.some((item) => item.id === productId);
      setWishlist(updatedWishlist);
      showToast(
        isAdded ? `${productName} added to wishlist!` : `${productName} removed from wishlist!`,
        "success"
      );
    } catch {
      showToast("Failed to update wishlist.", "error");
    }
  };

  const calculateDiscountPercent = (sellingPrice: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= sellingPrice) return null;
    const pct = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
    return pct > 0 ? `${pct}% off` : null;
  };

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Explore Catalog</p>
          <h1>Products</h1>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="info-card">
          <span>No products available yet.</span>
        </div>
      ) : (
        <div className="catalog-grid">
          {products.map((product) => {
            const mrp = product.original_price && product.original_price > product.price ? product.original_price : product.price * 3 || 999;
            const discountBadge = calculateDiscountPercent(product.price, mrp);

            return (
              <article
                key={product.id}
                className="product-card ecommerce-clean-card"
                onClick={() => navigate(`/app/products/${product.id}`)}
              >
                <div className="product-card-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="product-card-image-placeholder">No image</div>
                  )}
                  <button
                    type="button"
                    className={`wishlist-btn-floating ${isWishlisted(product.id) ? "active" : ""}`}
                    onClick={(e) => handleToggleWishlist(e, product.id, product.name)}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart
                      size={18}
                      fill={isWishlisted(product.id) ? "#ae4a34" : "none"}
                      stroke={isWishlisted(product.id) ? "#ae4a34" : "currentColor"}
                    />
                  </button>
                </div>

                <div className="product-card-body">
                  <p className="product-category-tag">{product.category}</p>
                  <h3 className="product-title">{product.name}</h3>
                  
                  <div className="product-price-block">
                    <span className="selling-price">₹{product.price.toLocaleString("en-IN")}</span>
                    {mrp > product.price && (
                      <span className="mrp-price">₹{mrp.toLocaleString("en-IN")}</span>
                    )}
                    {discountBadge && (
                      <span className="discount-badge">{discountBadge}</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
