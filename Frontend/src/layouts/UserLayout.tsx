import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Heart, 
  History, 
  Home, 
  LogOut, 
  Search, 
  Settings, 
  ShoppingBag, 
  ShoppingCart, 
  UserCircle2,
  Sparkles,
  Truck,
  RotateCcw,
  Tag,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getCart, getWishlist } from "../apis/user";
import Footer from "../components/layout/Footer";

function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      void getCart().then((items) => setCartCount(items.reduce((sum, item) => sum + item.quantity, 0))).catch(() => {});
      void getWishlist().then((items) => setWishlistCount(items.length)).catch(() => {});
    }
  }, [user, location.pathname]);

  if (!user) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/app/products`);
    }
  };

  return (
    <div className="storefront-shell">
      {/* 📢 Top Announcement Bar */}
      <div className="storefront-announcement">
        <div className="announcement-ticker">
          <span><Truck size={14} /> FREE Express Delivery on Orders Above ₹499</span>
          <span className="ticker-divider">•</span>
          <span><RotateCcw size={14} /> 30 Days Easy Return Policy</span>
          <span className="ticker-divider">•</span>
          <span><Tag size={14} /> Use Code <strong>WELCOME15</strong> for 15% OFF</span>
        </div>
      </div>

      {/* 💎 Main Storefront Header */}
      <header className="storefront-navbar">
        <div className="navbar-container">
          <Link to="/app" className="storefront-brand">
            <span className="brand-logo-icon">💎</span>
            <div className="brand-text-block">
              <span className="brand-title">GAHENA</span>
              <span className="brand-tagline">Luxury E-Commerce</span>
            </div>
          </Link>

          {/* Search Bar */}
          <form className="storefront-search-bar" onSubmit={handleSearchSubmit}>
            <Search size={18} className="search-icon-left" />
            <input
              type="text"
              placeholder="Search jewelry, dresses, tops, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="storefront-search-input"
            />
            <button type="submit" className="search-submit-btn">Search</button>
          </form>

          {/* Actions & User Menu */}
          <div className="navbar-actions">
            <NavLink to="/app/wishlist" className="navbar-action-btn" title="Wishlist">
              <Heart size={22} />
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
              <span className="action-label">Wishlist</span>
            </NavLink>

            <NavLink to="/app/cart" className="navbar-action-btn" title="Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
              <span className="action-label">Cart</span>
            </NavLink>

            {/* Profile Dropdown */}
            <div className="user-profile-dropdown-wrapper">
              <button
                type="button"
                className="user-profile-btn"
                onClick={() => setShowProfileMenu((prev) => !prev)}
              >
                <UserCircle2 size={24} />
                <span className="user-name-label">{user.name.split(" ")[0]}</span>
                <ChevronDown size={14} />
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown-menu" onClick={() => setShowProfileMenu(false)}>
                  <div className="dropdown-user-info">
                    <strong>{user.name}</strong>
                    <p>{user.email}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link to="/app/profile" className="dropdown-item">
                    <UserCircle2 size={16} /> My Profile
                  </Link>
                  <Link to="/app/orders" className="dropdown-item">
                    <History size={16} /> Order History
                  </Link>
                  <Link to="/app/settings" className="dropdown-item">
                    <Settings size={16} /> Account Settings
                  </Link>
                  <hr className="dropdown-divider" />
                  <button type="button" className="dropdown-item logout-item" onClick={logout}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🏷️ Horizontal Category Navigation Bar */}
        <nav className="storefront-cat-bar">
          <div className="cat-bar-container">
            <NavLink to="/app" end className={({ isActive }) => `cat-link ${isActive ? "active" : ""}`}>
              <Home size={16} /> Home
            </NavLink>
            <NavLink to="/app/products" end className={({ isActive }) => `cat-link ${isActive ? "active" : ""}`}>
              <ShoppingBag size={16} /> All Products
            </NavLink>
            <NavLink to="/app/products?category=Men's Wear" className="cat-link">
              Men's Wear
            </NavLink>
            <NavLink to="/app/products?category=Women's Wear" className="cat-link">
              Women's Wear
            </NavLink>
            <NavLink to="/app/products?category=Kids' Wear" className="cat-link">
              Children's Wear
            </NavLink>
            <NavLink to="/app/products?category=Jewellery" className="cat-link">
              <Sparkles size={16} /> Jewellery
            </NavLink>
            <NavLink to="/app/products?category=Men's Footwear" className="cat-link">
              Men's Footwear
            </NavLink>
            <NavLink to="/app/products?category=Women's Footwear" className="cat-link">
              Women's Footwear
            </NavLink>
            <NavLink to="/app/products?category=Kids' Footwear" className="cat-link">
              Kids' Footwear
            </NavLink>
            <NavLink to="/app/products" className="cat-link highlight">
              🔥 Steal Deals
            </NavLink>
            <NavLink to="/app/orders" className="cat-link">
              <History size={16} /> My Orders
            </NavLink>
          </div>
        </nav>
      </header>

      {/* 📄 Main Content Container */}
      <main className="storefront-main-content">
        <Outlet />
      </main>

      {/* 🌐 Storefront Footer */}
      <Footer />
    </div>
  );
}

export default UserLayout;

