import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UnauthorizedPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="loading-panel">
        <span>Checking session...</span>
      </main>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  }

  return (
    <main className="loading-panel">
      <h1>Unauthorized</h1>
      <p>You do not have access to this page.</p>
      <Link className="tab active" to="/login">
        Go to Login
      </Link>
    </main>
  );
}

export default UnauthorizedPage;
