import { useEffect, useState } from "react";
import { removeFromCart } from "../../apis/user";
import { getCart, type CartItem } from "../../apis/user";

function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    void getCart().then(setItems);
  }, []);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Cart</h1>
        </div>
      </header>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.productId}>
                <td>{item.product?.name}</td>
                <td>{item.quantity}</td>
                <td>₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}</td>
                <td>
                  <button
                    className="mini-button danger"
                    type="button"
                    onClick={async () => setItems(await removeFromCart(item.productId))}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CartPage;
