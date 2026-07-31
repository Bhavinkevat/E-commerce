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

  if (allowedRoles) {
    const isStaffRoute = allowedRoles.includes("admin");
    const isUserStaff = user.role !== "user";

    if (isStaffRoute && !isUserStaff) {
      return <Navigate to="/app" replace />;
    }
    if (!isStaffRoute && isUserStaff) {
      return <Navigate to="/admin" replace />;
    }
  }


  return <Outlet />;
}

export default RequireAuth;
