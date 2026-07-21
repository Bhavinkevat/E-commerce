import { Navigate, Route, Routes } from "react-router-dom";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import RequireAuth from "./routes/RequireAuth";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import AdminCouponsPage from "./pages/admin/CouponsPage";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import AdminCustomersPage from "./pages/admin/CustomersPage";
import AdminAnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminProfilePage from "./pages/admin/ProfilePage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import UserHomePage from "./pages/user/HomePage";
import UserProductsPage from "./pages/user/ProductsPage";
import UserProductDetailsPage from "./pages/user/ProductDetailsPage";
import UserCartPage from "./pages/user/CartPage";
import UserWishlistPage from "./pages/user/WishlistPage";
import UserOrderHistoryPage from "./pages/user/OrderHistoryPage";
import UserProfilePage from "./pages/user/ProfilePage";
import UserSettingsPage from "./pages/user/SettingsPage";

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth allowedRoles={["user"]} />}>
        <Route path="/app" element={<UserLayout />}>
          <Route index element={<UserHomePage />} />
          <Route path="products" element={<UserProductsPage />} />
          <Route path="products/:productId" element={<UserProductDetailsPage />} />
          <Route path="cart" element={<UserCartPage />} />
          <Route path="wishlist" element={<UserWishlistPage />} />
          <Route path="orders" element={<UserOrderHistoryPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="settings" element={<UserSettingsPage />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
