import { useEffect, useState } from "react";
import { getAdminAnalytics, getAdminOverview } from "../../apis/admin";

function AdminDashboardPage() {
  const [cards, setCards] = useState<Array<{ label: string; value: string }>>([]);
  const [analytics, setAnalytics] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    void getAdminOverview().then((data) => setCards(data.cards));
    void getAdminAnalytics().then(setAnalytics);
  }, []);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Dashboard</h1>
          <p className="summary">
            Operations ka overview, fast signals, aur next actions ek jagah.
          </p>
        </div>
      </header>

      <div className="dashboard-grid">
        {cards.map((card) => (
          <article key={card.label} className="stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="detail-grid">
        {analytics.map((item) => (
          <article key={item.label} className="info-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AdminDashboardPage;

