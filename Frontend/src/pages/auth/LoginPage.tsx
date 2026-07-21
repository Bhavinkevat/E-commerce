import { ArrowRight, Lock, Mail, Shield, KeyRound, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithOtp } from "../../apis/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import loginBanner from "../../assets/login_banner.png";

function LoginPage() {
  const { loginAsUser, submitting, error, message, clearFeedback } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password / OTP states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpStep, setOtpStep] = useState<1 | 2 | 3>(1); // 1 = Request OTP, 2 = Verify OTP, 3 = Reset Password
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const clearResetFeedback = () => {
    setResetError("");
    setResetMessage("");
  };

  const switchToForgotPassword = () => {
    clearFeedback();
    clearResetFeedback();
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpStep(1);
    setShowForgotPassword(true);
  };

  const switchToLogin = () => {
    clearFeedback();
    clearResetFeedback();
    setNewPassword("");
    setConfirmPassword("");
    setOtp("");
    setOtpStep(1);
    setShowForgotPassword(false);
  };

  const handleRequestOtp = async () => {
    if (!email.trim()) {
      setResetError("Email is required");
      return;
    }
    setResetSubmitting(true);
    clearResetFeedback();
    try {
      const response = await requestPasswordResetOtp(email);
      setResetMessage(response.message);
      showToast("OTP sent to your email successfully!", "success");
      setOtpStep(2);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Failed to request OTP");
      showToast(err instanceof Error ? err.message : "Failed to request OTP", "error");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setResetError("OTP code is required");
      return;
    }
    setResetSubmitting(true);
    clearResetFeedback();
    try {
      const response = await verifyPasswordResetOtp(email, otp);
      setResetMessage(response.message);
      showToast("OTP verified successfully!", "success");
      setOtpStep(3);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Invalid OTP code");
      showToast(err instanceof Error ? err.message : "Invalid OTP code", "error");
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }
    setResetSubmitting(true);
    clearResetFeedback();

    try {
      const response = await resetPasswordWithOtp({
        email,
        otp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setResetMessage(response.message);
      showToast("Password reset successfully!", "success");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setOtpStep(1);
      setTimeout(() => {
        switchToLogin();
      }, 1500);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Request failed");
      showToast(err instanceof Error ? err.message : "Failed to reset password", "error");
    } finally {
      setResetSubmitting(false);
    }
  };

  const activeError = showForgotPassword ? resetError : error;
  const activeMessage = showForgotPassword ? resetMessage : message;
  const isSubmitting = showForgotPassword ? resetSubmitting : submitting;

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
            EXCLUSIVE COLLECTION
          </p>
          <h2 style={{ fontSize: "2.4rem", fontWeight: "800", lineHeight: "1.2", margin: 0 }}>
            Timeless Elegance & Luxury Craftsmanship
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
              {showForgotPassword ? "Reset Password" : "Welcome Back!"}
            </h1>
            <p style={{ color: "#718277", fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>
              {showForgotPassword
                ? otpStep === 1
                  ? "Enter your email address to receive a verification OTP code."
                  : otpStep === 2
                    ? "Enter the OTP code received on your email to verify."
                    : "Enter your new password to complete the reset process."
                : "Log in now to explore all the features and benefits of our platform and see what's new."}
            </p>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (showForgotPassword) {
                if (otpStep === 1) {
                  void handleRequestOtp();
                } else if (otpStep === 2) {
                  void handleVerifyOtp();
                } else {
                  void handleResetPassword();
                }
                return;
              }
              loginAsUser({ email, password });
            }}
            style={{ display: "flex", flexDirection: "column", gap: "22px" }}
          >
            {/* Email Field */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                Enter your email
              </label>
              <input
                type="email"
                value={email}
                disabled={showForgotPassword && (otpStep === 2 || otpStep === 3)}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFeedback();
                  clearResetFeedback();
                }}
                placeholder="johndoe@mail.domain"
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

            {showForgotPassword ? (
              otpStep === 1 ? null : otpStep === 2 ? (
                /* OTP Input Step */
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                    Verification OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      clearResetFeedback();
                    }}
                    placeholder="Enter 6-digit OTP"
                    required
                    maxLength={6}
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      border: "1px solid #dbe2db",
                      background: "#f7f9f7",
                      fontSize: "0.95rem",
                      outline: "none",
                      letterSpacing: "4px",
                      fontWeight: "700",
                      color: "#18211d",
                    }}
                  />
                </div>
              ) : (
                /* New Password Step */
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        clearResetFeedback();
                      }}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1px solid #dbe2db",
                        background: "#f7f9f7",
                        fontSize: "0.95rem",
                        outline: "none",
                        color: "#18211d",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearResetFeedback();
                      }}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        border: "1px solid #dbe2db",
                        background: "#f7f9f7",
                        fontSize: "0.95rem",
                        outline: "none",
                        color: "#18211d",
                      }}
                    />
                  </div>
                </>
              )
            ) : (
              /* Normal Password Field */
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.88rem", fontWeight: "600", color: "#3a4740" }}>
                  Enter your Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFeedback();
                    }}
                    placeholder="••••••••••••"
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
            )}

            {/* Remember Me & Forgot Password Row */}
            {!showForgotPassword && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.88rem",
                  marginTop: "-4px",
                }}
              >
                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#65756c", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: "#1f6f59", borderRadius: "4px" }}
                  />
                  Remember my account
                </label>

                <button
                  type="button"
                  onClick={switchToForgotPassword}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#1f6f59",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Feedback Messages */}
            {activeError && (
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
                {activeError}
              </div>
            )}
            {activeMessage && (
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
                {activeMessage}
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
              {showForgotPassword ? (
                <button
                  type="button"
                  onClick={switchToLogin}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#65756c",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  ← Back to Login
                </button>
              ) : (
                <div style={{ fontSize: "0.88rem", color: "#65756c" }}>
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    onClick={clearFeedback}
                    style={{ color: "#1f6f59", fontWeight: "700", textDecoration: "none" }}
                  >
                    Register Now &gt;&gt;&gt;
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "14px 36px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #1f6f59 0%, #165242 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: "700",
                  fontSize: "1rem",
                  cursor: isSubmitting ? "wait" : "pointer",
                  boxShadow: "0 6px 16px rgba(31, 111, 89, 0.28)",
                  transition: "all 0.2s ease",
                }}
              >
                {isSubmitting
                  ? "Please wait..."
                  : showForgotPassword
                    ? otpStep === 1
                      ? "Send Reset OTP"
                      : otpStep === 2
                        ? "Verify OTP"
                        : "Reset Password"
                    : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
