import { ArrowRight, Lock, Mail, Shield } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../apis/auth";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { useAuth } from "../../context/AuthContext";

function LoginPage() {
  const { loginAsUser, submitting, error, message, clearFeedback } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
    setShowForgotPassword(true);
  };

  const switchToLogin = () => {
    clearFeedback();
    clearResetFeedback();
    setNewPassword("");
    setConfirmPassword("");
    setShowForgotPassword(false);
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearResetFeedback();

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      return;
    }

    setResetSubmitting(true);

    try {
      const response = await forgotPassword({
        email,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setResetMessage(response.message);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        switchToLogin();
      }, 1500);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Request failed");
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
              ? "Apna email aur naya password enter karo. Password reset hone ke baad login kar sakte ho."
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
              if (showForgotPassword) {
                void handleResetPassword(event);
                return;
              }
              event.preventDefault();
              loginAsUser({ email, password });
            }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
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
                  ? "Reset Password"
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
