import { Heart, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "../../components/common/Button";
import { addToCart, getProductDetails, toggleWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";

function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    const id = Number(productId);
    if (!Number.isNaN(id)) {
      void getProductDetails(id).then(setProduct);
    }
  }, [productId]);

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
          }}
        >
          Add to Cart
        </Button>
        <Button
          type="button"
          variant="ghost"
          icon={<Heart size={16} />}
          onClick={async () => {
            await toggleWishlist(product.id);
          }}
        >
          Wishlist
        </Button>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
