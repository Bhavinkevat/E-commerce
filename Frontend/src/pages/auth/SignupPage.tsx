import { Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthBannerSlider from "../../components/auth/AuthBannerSlider";

function SignupPage() {
  const { signupAsUser, submitting, error, message, clearFeedback } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-page-container">
      {/* Left Full-Height Banner Slider Column */}
      <AuthBannerSlider />

      {/* Right Form Column */}
      <div className="auth-form-column">
        <div className="auth-form-wrapper">
          {/* Mobile Brand Header */}
          <div className="auth-mobile-header">
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#1f6f59",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(31, 111, 89, 0.3)",
              }}
            >
              <Shield size={22} color="#ffffff" />
            </div>
            <span
              style={{
                fontSize: "1.35rem",
                fontWeight: "800",
                letterSpacing: "1.5px",
                color: "#18211d",
              }}
            >
              GAHENA
            </span>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Sign up now to browse our exclusive collections, track your orders, and manage your wishlist.
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              signupAsUser({ name, email, password, role: "user" });
            }}
            style={{ display: "flex", flexDirection: "column", gap: "22px" }}
          >
            {/* Name Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFeedback();
                }}
                placeholder="Bhavin Kevat"
                required
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: "1px solid #dbe2db",
                  background: "#f7f9f7",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "all 0.2s ease",
                  color: "#18211d",
                }}
              />
            </div>

            {/* Email Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFeedback();
                }}
                placeholder="bhavin@example.com"
                required
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  border: "1px solid #dbe2db",
                  background: "#f7f9f7",
                  fontSize: "0.95rem",
                  outline: "none",
                  transition: "all 0.2s ease",
                  color: "#18211d",
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFeedback();
                  }}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "14px 44px 14px 18px",
                    borderRadius: "12px",
                    border: "1px solid #dbe2db",
                    background: "#f7f9f7",
                    fontSize: "0.95rem",
                    outline: "none",
                    color: "#18211d",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#718277",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#b91c1c",
                  fontSize: "0.88rem",
                  fontWeight: "500",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {error}
              </div>
            )}
            {message && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#047857",
                  fontSize: "0.88rem",
                  fontWeight: "500",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                {message}
              </div>
            )}

            {/* Bottom Action Footer Row */}
            <div className="auth-footer-row">
              <div style={{ fontSize: "0.88rem", color: "#65756c" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  onClick={clearFeedback}
                  style={{ color: "#1f6f59", fontWeight: "700", textDecoration: "none" }}
                >
                  Login Here &gt;&gt;&gt;
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="auth-submit-btn"
              >
                {submitting ? "Creating..." : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
