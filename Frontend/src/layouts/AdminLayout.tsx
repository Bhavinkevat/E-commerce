import { Outlet } from "react-router-dom";
import { BarChart3, Boxes, ClipboardList, LayoutDashboard, Settings, Tag, UserCircle2, Users } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const items = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Products", to: "/admin/products", icon: Boxes },
  { label: "Coupons", to: "/admin/coupons", icon: Tag },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { label: "Profile", to: "/admin/profile", icon: UserCircle2 },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-shell">
      <Sidebar
        user={user}
        title="Admin Panel"
        subtitle="Operations control"
        items={items}
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
