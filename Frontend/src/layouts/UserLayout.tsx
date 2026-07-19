import { Outlet } from "react-router-dom";
import { Heart, History, Home, Settings, ShoppingBag, ShoppingCart, UserCircle2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const items = [
  { label: "Home", to: "/app", icon: Home },
  { label: "Products", to: "/app/products", icon: ShoppingBag },
  { label: "Product Details", to: "/app/products/101", icon: UserCircle2 },
  { label: "Cart", to: "/app/cart", icon: ShoppingCart },
  { label: "Wishlist", to: "/app/wishlist", icon: Heart },
  { label: "Orders", to: "/app/orders", icon: History },
  { label: "Profile", to: "/app/profile", icon: UserCircle2 },
  { label: "Settings", to: "/app/settings", icon: Settings },
];

function UserLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-shell">
      <Sidebar
        user={user}
        title="User Panel"
        subtitle="Shopping experience"
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

export default UserLayout;
