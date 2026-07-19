import { useEffect, useState } from "react";
import { Heart, ShoppingCart, CreditCard } from "lucide-react";
import { getWishlist, toggleWishlist, addToCart } from "../../apis/user";
import type { Product } from "../../types/catalog";
import Button from "../../components/common/Button";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    void getWishlist().then(setItems);
  }, []);

  const handleRemoveFromWishlist = async (productId: number, productName: string) => {
    try {
      const updatedWishlist = await toggleWishlist(productId);
      setItems(updatedWishlist);
      showToast(`${productName} removed from wishlist.`, "success");
    } catch (error) {
      showToast("Failed to remove item from wishlist.", "error");
    }
  };

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Wishlist</h1>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="info-card">
          <span>Your wishlist is empty.</span>
        </div>
      ) : (
        <div className="catalog-grid">
          {items.map((item) => (
            <article key={item.id} className="product-card">
              <div className="product-card-image" style={{ position: "relative" }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <div className="product-card-image-placeholder">No image</div>
                )}
                <button
                  type="button"
                  className="wishlist-btn-floating active"
                  onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                  aria-label="Remove from Wishlist"
                >
                  <Heart
                    size={18}
                    fill="#ae4a34"
                    stroke="#ae4a34"
                  />
                </button>
              </div>

              <div className="product-card-body">
                <p className="product-category">{item.category}</p>
                <h3>{item.name}</h3>
                <p className="summary compact">{item.description}</p>
              </div>

              <div className="product-meta">
                <strong>₹{item.price.toLocaleString("en-IN")}</strong>
                <span>Stock: {item.stock}</span>
                <span>Rating: {item.rating}</span>
              </div>

              <div className="row-actions product-card-actions">
                <Button
                  type="button"
                  icon={<ShoppingCart size={16} />}
                  onClick={async () => {
                    await addToCart(item.id);
                    showToast(`${item.name} added to cart!`, "success");
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
                    await addToCart(item.id);
                    showToast(`${item.name} added to cart. Proceeding to checkout.`, "success");
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

export default WishlistPage;
