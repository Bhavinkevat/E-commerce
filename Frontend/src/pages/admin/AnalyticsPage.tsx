function AnalyticsPage() {
  const metrics = [
    ["Conversion", "4.7%"],
    ["Return Rate", "1.2%"],
    ["Average Order", "₹2,399"],
    ["Repeat Buyers", "38%"],
  ];

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Analytics</h1>
        </div>
      </header>

      <div className="detail-grid">
        {metrics.map(([label, value]) => (
          <article key={label} className="stat-card">
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AnalyticsPage;

