import { useEffect, useState } from "react";
import { listOrders } from "../../apis/admin";
import type { OrderSummary } from "../../types/catalog";

function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    void listOrders().then(setOrders);
  }, []);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Orders</h1>
        </div>
      </header>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.orderNo}</td>
                <td>{order.customer}</td>
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

export default OrdersPage;

