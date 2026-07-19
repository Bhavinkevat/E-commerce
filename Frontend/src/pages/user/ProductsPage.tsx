import { useEffect, useState } from "react";
import { Heart, ShoppingCart, CreditCard } from "lucide-react";
import { addToCart, listProducts, toggleWishlist, getWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";
import Button from "../../components/common/Button";
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

  const handleToggleWishlist = async (productId: number, productName: string) => {
    try {
      const updatedWishlist = await toggleWishlist(productId);
      const isAdded = updatedWishlist.some((item) => item.id === productId);
      setWishlist(updatedWishlist);
      showToast(
        isAdded ? `${productName} added to wishlist!` : `${productName} removed from wishlist!`,
        "success"
      );
    } catch (error) {
      showToast("Failed to update wishlist.", "error");
    }
  };

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Products</h1>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="info-card">
          <span>No products available yet.</span>
        </div>
      ) : (
        <div className="catalog-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-card-image" style={{ position: "relative" }}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="product-card-image-placeholder">No image</div>
                )}
                <button
                  type="button"
                  className={`wishlist-btn-floating ${isWishlisted(product.id) ? "active" : ""}`}
                  onClick={() => handleToggleWishlist(product.id, product.name)}
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
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <p className="summary compact">{product.description}</p>
              </div>

              <div className="product-meta">
                <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                <span>Stock: {product.stock}</span>
                <span>Rating: {product.rating}</span>
              </div>

              <div className="row-actions product-card-actions">
                <Button
                  type="button"
                  icon={<ShoppingCart size={16} />}
                  onClick={async () => {
                    await addToCart(product.id);
                    showToast(`${product.name} added to cart!`, "success");
                  }}
                  style={{ width: "100%" }}
                >
                  Add to Cart
                </Button>
                <Button
                  type="button"
                  variant="dark"
                  icon={<CreditCard size={16} />}
                  onClick={async () => {
                    await addToCart(product.id);
                    showToast(`${product.name} added to cart. Proceeding to checkout.`, "success");
                    navigate("/app/cart");
                  }}
                  style={{ width: "100%" }}
                >
                  Buy Now
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
