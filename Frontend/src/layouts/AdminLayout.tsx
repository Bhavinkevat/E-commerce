import { Navigate, Outlet, useLocation } from "react-router-dom";
import { BarChart3, Boxes, ClipboardList, LayoutDashboard, Settings, ShieldCheck, Tag, UserCircle2, Users } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const items = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Boxes, module: "Products" },
  { label: "Coupons", to: "/admin/coupons", icon: Tag, module: "Coupons" },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList, module: "Orders" },
  { label: "Customers", to: "/admin/customers", icon: Users, module: "Customers" },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3, module: "Analytics" },
  { label: "Role & Permissions", to: "/admin/roles", icon: ShieldCheck, module: "Role & Permissions" },
  { label: "Profile", to: "/admin/profile", icon: UserCircle2 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const location = useLocation();

  if (!user) {
    return null;
  }

  const isSuperAdmin = user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "super admin";

  const visibleItems = items.filter((item) => {
    if (!item.module) return true;
    if (isSuperAdmin) return true;

    const perm = user.permissions?.[item.module];
    return perm ? Boolean(perm.can_view) : false;
  });

  // Guard direct URL access if module VIEW permission is false
  const currentItem = items.find((i) => i.to === location.pathname);
  if (!isSuperAdmin && currentItem?.module) {
    const perm = user.permissions?.[currentItem.module];
    if (perm && !perm.can_view) {
      return <Navigate to="/admin" replace />;
    }
  }

  return (
    <main className="dashboard-shell">
      <Sidebar
        user={user}
        title="Admin Panel"
        subtitle="Operations control"
        items={visibleItems}
        open={open}
        onToggle={() => setOpen((current) => !current)}
        onLogout={logout}
      />

      <section className="dashboard-main">
        <Outlet />
      </section>
    </main>
  );
}

export default AdminLayout;

