import { Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import loginBanner from "../../assets/login_banner.png";

function SignupPage() {
  const { signupAsUser, submitting, error, message, clearFeedback } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {/* Left Full-Height Banner Column */}
      <div
        style={{
          flex: "1 1 50%",
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          background: "#18211d",
        }}
      >
        {/* Background Banner Image */}
        <img
          src={loginBanner}
          alt="Luxury Jewelry"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.88,
          }}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        {/* Top Brand Logo */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <Shield size={24} color="#ffffff" />
          </div>
          <span style={{ fontSize: "1.4rem", fontWeight: "800", letterSpacing: "1.5px" }}>GAHENA</span>
        </div>

        {/* Bottom Banner Title */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            color: "#ffffff",
            maxWidth: "520px",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "2.5px",
              color: "#e0e8e3",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            JOIN OUR COMMUNITY
          </p>
          <h2 style={{ fontSize: "2.4rem", fontWeight: "800", lineHeight: "1.2", margin: 0 }}>
            Create Your Account & Explore Premium Jewelry
          </h2>
        </div>
      </div>

      {/* Right Full-Height Form Column */}
      <div
        style={{
          flex: "1 1 50%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 60px",
          background: "#ffffff",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "2.4rem",
                fontWeight: "800",
                color: "#18211d",
                margin: "0 0 10px 0",
                letterSpacing: "-0.5px",
              }}
            >
              Create Account
            </h1>
            <p style={{ color: "#718277", fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "12px",
                gap: "12px",
              }}
            >
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
                style={{
                  padding: "14px 36px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1f6f59 0%, #165242 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "1rem",
                  cursor: submitting ? "wait" : "pointer",
                  boxShadow: "0 6px 16px rgba(31, 111, 89, 0.28)",
                  transition: "all 0.2s ease",
                }}
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
