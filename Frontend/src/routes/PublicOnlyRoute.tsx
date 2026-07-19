import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicOnlyRoute() {
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

  return <Outlet />;
}

export default PublicOnlyRoute;

