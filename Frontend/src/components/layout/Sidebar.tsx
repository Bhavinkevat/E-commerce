import { LogOut, Menu, Shield, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { User } from "../../types/auth";

export type SidebarItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

type SidebarProps = {
  user: User;
  title: string;
  subtitle: string;
  items: SidebarItem[];
  open: boolean;
  onToggle: () => void;
  onLogout: () => void;
};

function Sidebar({
  user,
  title,
  subtitle,
  items,
  open,
  onToggle,
  onLogout,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${open ? "open" : "closed"}`}>
      <button
        type="button"
        className="icon-button menu-button"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        <Menu size={18} />
      </button>

      <div className="sidebar-brand">
        <div className="brand-mark">
          <Shield size={18} />
        </div>
        <div>
          <p className="eyebrow">Gahena</p>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              end={item.to === "/admin" || item.to === "/app"}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="profile-chip">
          <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <button type="button" className="logout-button" onClick={onLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
