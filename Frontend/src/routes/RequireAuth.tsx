import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type RequireAuthProps = {
  allowedRoles?: Array<"admin" | "user">;
};

function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="loading-panel">
        <span>Checking session...</span>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/app"} replace />;
  }

  return <Outlet />;
}

export default RequireAuth;
