import { useEffect, useState } from "react";
import { getOrderHistory } from "../../apis/user";
import type { OrderSummary } from "../../types/catalog";

function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    void getOrderHistory().then(setOrders);
  }, []);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Order History</h1>
        </div>
      </header>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNo}</td>
                <td>₹{order.total.toLocaleString("en-IN")}</td>
                <td>{order.status}</td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrderHistoryPage;

