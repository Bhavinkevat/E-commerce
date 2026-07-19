import { useEffect, useState } from "react";
import { getHomeSummary } from "../../apis/user";

function HomePage() {
  const [cards, setCards] = useState<Array<{ label: string; value: string }>>([]);

  useEffect(() => {
    void getHomeSummary().then((data) => setCards(data.cards));
  }, []);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Home</h1>
          <p className="summary">Aapka shopping overview yahan dikhega.</p>
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
    </section>
  );
}

export default HomePage;

