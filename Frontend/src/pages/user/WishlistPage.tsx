import { useEffect, useState } from "react";
import { getWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";

function WishlistPage() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    void getWishlist().then(setItems);
  }, []);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Wishlist</h1>
        </div>
      </header>

      <div className="catalog-grid">
        {items.map((item) => (
          <article key={item.id} className="product-card">
            <h3>{item.name}</h3>
            <strong>₹{item.price.toLocaleString("en-IN")}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default WishlistPage;
