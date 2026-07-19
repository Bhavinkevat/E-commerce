import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="loading-panel">
      <h1>404</h1>
      <p>Page not found.</p>
      <Link className="tab active" to="/login">
        Back to Login
      </Link>
    </main>
  );
}

export default NotFoundPage;

