import { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { addToCart, listProducts, toggleWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";
import Button from "../../components/common/Button";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    void listProducts().then(setProducts);
  }, []);

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
              <div className="product-card-image">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="product-card-image-placeholder">No image</div>
                )}
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;
