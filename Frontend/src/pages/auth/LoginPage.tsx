import { ArrowRight, Lock, Mail, Shield, KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordResetOtp, verifyPasswordResetOtp, resetPasswordWithOtp } from "../../apis/auth";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function LoginPage() {
  const { loginAsUser, submitting, error, message, clearFeedback } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
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
    <main className="auth-shell">
      <section className="auth-layout">
        <div className="auth-copy">
          <div className="brand-mark large">
            <Shield size={28} />
          </div>
          <p className="eyebrow">Gahena</p>
          <h1>{showForgotPassword ? "Reset Password" : "Login"}</h1>
          <p className="summary">
            {showForgotPassword
              ? otpStep === 1 
                ? "Enter your email address to receive a verification OTP code."
                : otpStep === 2
                  ? "Enter the OTP code received on your email to verify."
                  : "Enter your new password to complete the reset process."
              : "Role detect hoga aur usi hisaab se Admin Panel ya User Panel khulega."}
          </p>
          <div className="feature-list">
            <div>
              <Shield size={18} />
              <span>Role-aware redirects</span>
            </div>
            <div>
              <Lock size={18} />
              <span>Protected pages after login</span>
            </div>
          </div>
        </div>

        <section className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" className="tab active">
              {showForgotPassword ? "Reset Password" : "Login"}
            </button>
            <Link className="tab" to="/signup" onClick={clearFeedback}>
              Sign Up
            </Link>
          </div>

          <form
            className="auth-form"
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
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              disabled={showForgotPassword && (otpStep === 2 || otpStep === 3)}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFeedback();
                clearResetFeedback();
              }}
              placeholder="bhavin@example.com"
              icon={<Mail size={18} />}
              required
            />

            {showForgotPassword ? (
              otpStep === 1 ? (
                null
              ) : otpStep === 2 ? (
                <TextField
                  label="Verification OTP"
                  type="text"
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value);
                    clearResetFeedback();
                  }}
                  placeholder="Enter 6-digit OTP"
                  icon={<KeyRound size={18} />}
                  required
                  maxLength={6}
                />
              ) : (
                <>
                  <TextField
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      clearResetFeedback();
                    }}
                    placeholder="Enter new password"
                    icon={<Lock size={18} />}
                    showPasswordToggle
                    required
                    minLength={6}
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setNewPassword(newPassword); // keep newPassword in state
                      setConfirmPassword(event.target.value);
                      clearResetFeedback();
                    }}
                    placeholder="Confirm new password"
                    icon={<Lock size={18} />}
                    showPasswordToggle
                    required
                    minLength={6}
                  />
                </>
              )
            ) : (
              <>
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearFeedback();
                  }}
                  placeholder="Enter password"
                  icon={<Lock size={18} />}
                  showPasswordToggle
                  required
                  minLength={6}
                />
                <div className="auth-link-row">
                  <button
                    type="button"
                    className="auth-text-link"
                    onClick={switchToForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            )}

            {activeError ? <div className="feedback error">{activeError}</div> : null}
            {activeMessage ? <div className="feedback success">{activeMessage}</div> : null}

            <Button type="submit" icon={<ArrowRight size={18} />} disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : showForgotPassword
                  ? otpStep === 1 
                    ? "Send Reset OTP" 
                    : otpStep === 2 
                      ? "Verify OTP" 
                      : "Reset Password"
                  : "Login"}
            </Button>

            {showForgotPassword ? (
              <div className="auth-link-row center">
                <button type="button" className="auth-text-link" onClick={switchToLogin}>
                  Back to Login
                </button>
              </div>
            ) : null}
          </form>
        </section>
      </section>
    </main>
  );
}

export default LoginPage;
