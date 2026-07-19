import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus } from "../../apis/admin";
import type { OrderSummary } from "../../types/catalog";
import { Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    void listOrders().then(setOrders);
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === orderId ? updatedOrder : o))
      );
      showToast(`Order #${updatedOrder.orderNo} updated to ${newStatus}!`, "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update order status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return {
          background: "rgba(245, 158, 11, 0.12)",
          color: "#b45309",
          borderColor: "rgba(245, 158, 11, 0.3)",
        };
      case "shipped":
        return {
          background: "rgba(99, 102, 241, 0.12)",
          color: "#4338ca",
          borderColor: "rgba(99, 102, 241, 0.3)",
        };
      case "delivered":
        return {
          background: "rgba(16, 185, 129, 0.12)",
          color: "#047857",
          borderColor: "rgba(16, 185, 129, 0.3)",
        };
      default:
        return {
          background: "#f4f6f2",
          color: "#18211d",
          borderColor: "#cfd8d0",
        };
    }
  };

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
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  No orders placed yet.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNo}</td>
                  <td>{order.customer}</td>
                  <td>₹{order.total.toLocaleString("en-IN")}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{
                          ...getStatusStyles(order.status),
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: updatingId === order.id ? "wait" : "pointer",
                          outline: "none",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <option value="Pending" style={{ color: "#18211d", background: "#ffffff" }}>
                          Pending
                        </option>
                        <option value="Shipped" style={{ color: "#18211d", background: "#ffffff" }}>
                          Shipped
                        </option>
                        <option value="Delivered" style={{ color: "#18211d", background: "#ffffff" }}>
                          Delivered
                        </option>
                      </select>
                      {updatingId === order.id && (
                        <Loader2 size={16} className="animate-spin" style={{ color: "#1f6f59" }} />
                      )}
                    </div>
                  </td>
                  <td>{order.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrdersPage;

