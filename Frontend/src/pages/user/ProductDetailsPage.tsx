import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import { addToCart, getProductDetails, toggleWishlist, getWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";
import { useToast } from "../../context/ToastContext";

function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    const id = Number(productId);
    if (!Number.isNaN(id)) {
      void getProductDetails(id).then(setProduct);
      void getWishlist().then(setWishlist);
    }
  }, [productId]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      const updatedWishlist = await toggleWishlist(product.id);
      const isAdded = updatedWishlist.some((item) => item.id === product.id);
      setWishlist(updatedWishlist);
      showToast(
        isAdded ? `${product.name} added to wishlist!` : `${product.name} removed from wishlist!`,
        "success"
      );
    } catch {
      showToast("Failed to update wishlist.", "error");
    }
  };

  if (!product) {
    return (
      <section className="panel-stack">
        <p className="eyebrow">User</p>
        <h1>Product Details</h1>
        <div className="info-card">
          <span>Product not found</span>
        </div>
      </section>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>{product.name}</h1>
          <p className="summary">{product.description}</p>
        </div>
      </header>

      <div className="detail-grid">
        <article className="info-card">
          <span>Price</span>
          <strong>₹{product.price.toLocaleString("en-IN")}</strong>
        </article>
        <article className="info-card">
          <span>Stock</span>
          <strong>{product.stock}</strong>
        </article>
        <article className="info-card">
          <span>Rating</span>
          <strong>{product.rating}</strong>
        </article>
      </div>

      <div className="row-actions">
        <Button
          type="button"
          icon={<ShoppingCart size={16} />}
          onClick={async () => {
            await addToCart(product.id);
            showToast(`${product.name} added to cart!`, "success");
          }}
        >
          Add to Cart
        </Button>
        <Button
          type="button"
          variant={isWishlisted ? "primary" : "ghost"}
          icon={<Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />}
          onClick={handleToggleWishlist}
        >
          Wishlist
        </Button>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
