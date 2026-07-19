import { useEffect, useState } from "react";
import { listCustomers } from "../../apis/admin";
import type { CustomerSummary } from "../../types/catalog";

function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);

  useEffect(() => {
    void listCustomers().then(setCustomers);
  }, []);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Customers</h1>
        </div>
      </header>

      <div className="detail-grid">
        {customers.map((customer) => (
          <article key={customer.id} className="info-card">
            <span>{customer.name}</span>
            <strong>{customer.email}</strong>
            <p className="summary compact">
              Orders: {customer.orders} | Spent: ₹
              {customer.spent.toLocaleString("en-IN")} | Status: {customer.status}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CustomersPage;

