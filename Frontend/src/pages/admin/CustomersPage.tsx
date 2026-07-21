import { useEffect, useState } from "react";
import { listCustomers } from "../../apis/admin";
import type { CustomerSummary } from "../../types/catalog";
import { Search, Mail, ShoppingBag, ShieldCheck, Users, CreditCard } from "lucide-react";

function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void listCustomers()
      .then((data) => setCustomers(data))
      .finally(() => setLoading(false));
  }, []);

  // Filter customers by search term
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.spent || 0), 0);

  // Helper for status badge style
  const getStatusBadge = (status: string) => {
    const isActive = status.toLowerCase() === "active";
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: "600",
          backgroundColor: isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
          color: isActive ? "#047857" : "#b91c1c",
          border: `1px solid ${isActive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: isActive ? "#10b981" : "#ef4444",
          }}
        />
        {status}
      </span>
    );
  };

  return (
    <section className="panel-stack" style={{ gap: "20px" }}>
      {/* Top Header */}
      <header className="panel-header" style={{ marginBottom: "0" }}>
        <div>
          <p className="eyebrow">Admin Operations</p>
          <h1>Customers Overview</h1>
        </div>
      </header>

      {/* KPI Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: "#ffffff",
            border: "1px solid #d9dfd8",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(31, 111, 89, 0.1)",
              color: "#1f6f59",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#65756c", fontWeight: "500" }}>Total Customers</span>
            <h3 style={{ margin: "2px 0 0", fontSize: "1.35rem", color: "#18211d" }}>{totalCustomers}</h3>
          </div>
        </div>

        <div
          style={{
            padding: "16px 20px",
            background: "#ffffff",
            border: "1px solid #d9dfd8",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(16, 185, 129, 0.1)",
              color: "#047857",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#65756c", fontWeight: "500" }}>Active Accounts</span>
            <h3 style={{ margin: "2px 0 0", fontSize: "1.35rem", color: "#18211d" }}>{activeCustomers}</h3>
          </div>
        </div>

        <div
          style={{
            padding: "16px 20px",
            background: "#ffffff",
            border: "1px solid #d9dfd8",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "rgba(245, 158, 11, 0.1)",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <span style={{ fontSize: "0.82rem", color: "#65756c", fontWeight: "500" }}>Customer Revenue</span>
            <h3 style={{ margin: "2px 0 0", fontSize: "1.35rem", color: "#18211d" }}>
              ₹{totalRevenue.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-card" style={{ padding: "20px" }}>
        {/* Search & Action Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              minWidth: "280px",
              flex: "1",
              maxWidth: "400px",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#88968d",
              }}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 38px",
                border: "1px solid #cfd8d0",
                borderRadius: "8px",
                fontSize: "0.9rem",
                outline: "none",
                background: "#fafcf9",
                color: "#18211d",
              }}
            />
          </div>

          <div style={{ fontSize: "0.85rem", color: "#65756c", fontWeight: "500" }}>
            Showing <strong>{filteredCustomers.length}</strong> of {totalCustomers} customers
          </div>
        </div>

        {/* Customer Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ minWidth: "650px" }}>
            <thead>
              <tr style={{ background: "#f6f8f5" }}>
                <th style={{ padding: "12px 14px", borderRadius: "6px 0 0 6px" }}>Customer</th>
                <th style={{ padding: "12px 14px" }}>Email</th>
                <th style={{ padding: "12px 14px", textAlign: "center" }}>Orders</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Total Spent</th>
                <th style={{ padding: "12px 14px", textAlign: "center", borderRadius: "0 6px 6px 0" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#65756c" }}>
                    Loading customers...
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "#65756c" }}>
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const initial = customer.name ? customer.name.charAt(0).toUpperCase() : "?";
                  return (
                    <tr key={customer.id} style={{ transition: "background 0.15s ease" }}>
                      {/* Name & Avatar */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #1f6f59 0%, #154c3d 100%)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "0.9rem",
                              flexShrink: 0,
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#18211d", fontSize: "0.95rem" }}>
                              {customer.name || "N/A"}
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "#88968d" }}>ID: #{customer.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#3a4740", fontSize: "0.9rem" }}>
                          <Mail size={14} style={{ color: "#88968d" }} />
                          <span>{customer.email}</span>
                        </div>
                      </td>

                      {/* Orders */}
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            background: "#f0f4f1",
                            color: "#18211d",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                          }}
                        >
                          <ShoppingBag size={13} style={{ color: "#1f6f59" }} />
                          {customer.orders} {customer.orders === 1 ? "order" : "orders"}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: "700", color: "#1f6f59", fontSize: "0.95rem" }}>
                        ₹{customer.spent.toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        {getStatusBadge(customer.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default CustomersPage;
