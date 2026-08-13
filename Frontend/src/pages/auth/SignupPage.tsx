import React, { useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthBannerSlider from "../../components/auth/AuthBannerSlider";
import { BrandLogo } from "../../components/common/BrandLogo";

// List of fake / disposable / nonsense email domains to reject
const BANNED_EMAIL_DOMAINS = [
  "asdf.com",
  "asdf.in",
  "test.com",
  "xyz.com",
  "abc.com",
  "fake.com",
  "junk.com",
  "temp.com",
  "example.com",
  "123.com",
  "aaaa.com"
];

function SignupPage() {
  const { signupAsUser, submitting, error, message, clearFeedback } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form field focus tracking for live validation UX
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  // 1. Mobile Number Validation (Strict 10-digit Indian Mobile check)
  const isPhoneValid = /^[6-9]\d{9}$/.test(phone);

  // 2. Email Validation (Strict format & real domain check)
  const validateEmail = (mailStr: string): boolean => {
    const trimmed = mailStr.trim().toLowerCase();
    const basicRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicRegex.test(trimmed)) return false;

    const domain = trimmed.split("@")[1];
    if (!domain) return false;

    // Check if domain is in banned list or nonsense
    if (BANNED_EMAIL_DOMAINS.includes(domain)) return false;
    if (domain.length < 4) return false; // e.g. a.c is invalid

    return true;
  };

  const isEmailValid = validateEmail(email);

  // 3. Password Strength Meter Calculation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

  const calculatePasswordStrength = (): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (score <= 1) return { score: 1, label: "Weak Password", color: "#ef4444" };
    if (score === 2) return { score: 2, label: "Moderate Password", color: "#f59e0b" };
    if (score === 3) return { score: 3, label: "Good Password", color: "#3b82f6" };
    return { score: 4, label: "Strong & Secure ✨", color: "#d4af37" };
  };

  const passwordStrength = calculatePasswordStrength();
  const isPasswordValid = hasMinLength && (hasUppercase || hasLowercase) && (hasNumber || hasSpecial);

  // Handle phone input formatting (digits only, max 10)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    clearFeedback();
  };

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPhone(true);
    setTouchedEmail(true);
    setTouchedPassword(true);

    if (!isPhoneValid) {
      return;
    }
    if (!isEmailValid) {
      return;
    }
    if (!isPasswordValid) {
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();

    signupAsUser({
      name: fullName,
      email,
      phone,
      password,
      role: "user",
    });
  };

  return (
    <div className="auth-page-container">
      {/* Left Full-Height Banner Slider Column */}
      <AuthBannerSlider />

      {/* Right Form Column */}
      <div className="auth-form-column">
        <div className="auth-form-wrapper animate-fade-in-up">
          {/* Mobile Brand Header */}
          <div className="auth-mobile-header">
            <BrandLogo size="medium" />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">
              Sign up now to explore our exclusive luxury jewelry & couture collections.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            
            {/* 👤 1. First Name & Last Name Fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="field">
                <span>First Name</span>
                <div className="input-wrap">
                  <UserIcon size={18} />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearFeedback();
                    }}
                    placeholder=""
                    required
                  />
                </div>
              </div>

              <div className="field">
                <span>Last Name</span>
                <div className="input-wrap">
                  <UserIcon size={18} />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearFeedback();
                    }}
                    placeholder=""
                    required
                  />
                </div>
              </div>
            </div>

            {/* 📱 2. Compulsory 10-Digit Mobile Number Field */}
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Mobile Number</span>
                {touchedPhone && (
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: isPhoneValid ? "#4ade80" : "#fca5a5" }}>
                    {isPhoneValid ? "✓ Valid 10 Digits" : "❌ 10 Digits Required"}
                  </span>
                )}
              </div>
              
              <div 
                className="input-wrap"
                style={{ 
                  borderColor: touchedPhone && !isPhoneValid ? "#ef4444" : isPhoneValid ? "var(--gold-primary)" : undefined 
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Phone size={18} color="var(--gold-accent)" />
                  <span style={{ color: "var(--gold-light)", fontWeight: "800", fontSize: "0.9rem" }}>+91</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setTouchedPhone(true)}
                  placeholder=""
                  maxLength={10}
                  required
                />
                {isPhoneValid && <Check size={18} color="#4ade80" />}
              </div>
              {touchedPhone && !isPhoneValid && (
                <p className="field-error">
                  <AlertCircle size={13} style={{ display: "inline", marginRight: "4px" }} />
                  Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.
                </p>
              )}
            </div>

            {/* ✉️ 3. Strict Real Email Field */}
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Email Address</span>
                {touchedEmail && email && (
                  <span style={{ fontSize: "0.78rem", fontWeight: "700", color: isEmailValid ? "#4ade80" : "#fca5a5" }}>
                    {isEmailValid ? "✓ Valid Email" : "❌ Real Email Required"}
                  </span>
                )}
              </div>

              <div 
                className="input-wrap"
                style={{ 
                  borderColor: touchedEmail && !isEmailValid ? "#ef4444" : isEmailValid ? "var(--gold-primary)" : undefined 
                }}
              >
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFeedback();
                  }}
                  onBlur={() => setTouchedEmail(true)}
                  placeholder=""
                  required
                />
                {isEmailValid && <Check size={18} color="#4ade80" />}
              </div>
              {touchedEmail && !isEmailValid && email && (
                <p className="field-error">
                  <AlertCircle size={13} style={{ display: "inline", marginRight: "4px" }} />
                  Please enter a valid real email address (e.g. name@gmail.com, name@yahoo.com). Random/fake emails are not accepted.
                </p>
              )}
            </div>

            {/* 🔑 4. Password Field & Live Strength Meter */}
            <div className="field">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Password</span>
                {password && (
                  <span style={{ fontSize: "0.8rem", fontWeight: "800", color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                )}
              </div>

              <div className="input-wrap has-toggle">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFeedback();
                  }}
                  onBlur={() => setTouchedPassword(true)}
                  placeholder=""
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Live Password Strength Meter Bars */}
              {password && (
                <div style={{ marginTop: "6px" }}>
                  <div style={{ display: "flex", gap: "6px", height: "5px", marginBottom: "8px" }}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          flex: 1,
                          height: "100%",
                          borderRadius: "4px",
                          background: level <= passwordStrength.score ? passwordStrength.color : "rgba(255, 255, 255, 0.12)",
                          transition: "all 0.3s ease"
                        }}
                      />
                    ))}
                  </div>

                  {/* Password Requirements Checklist */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "0.78rem" }}>
                    <span style={{ color: hasMinLength ? "#4ade80" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {hasMinLength ? <Check size={12} /> : <X size={12} />} At least 8 characters
                    </span>
                    <span style={{ color: hasUppercase ? "#4ade80" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {hasUppercase ? <Check size={12} /> : <X size={12} />} One uppercase (A-Z)
                    </span>
                    <span style={{ color: hasNumber ? "#4ade80" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {hasNumber ? <Check size={12} /> : <X size={12} />} One number (0-9)
                    </span>
                    <span style={{ color: hasSpecial ? "#4ade80" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      {hasSpecial ? <Check size={12} /> : <X size={12} />} One special symbol (@#$)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Banners */}
            {error && (
              <div className="feedback error animate-fade-in-scale">
                <AlertCircle size={16} style={{ display: "inline", marginRight: "6px" }} />
                {error}
              </div>
            )}
            {message && (
              <div className="feedback success animate-fade-in-scale">
                <ShieldCheck size={16} style={{ display: "inline", marginRight: "6px" }} />
                {message}
              </div>
            )}

            {/* Bottom Action Footer Row */}
            <div className="auth-footer-row" style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  onClick={clearFeedback}
                  className="auth-text-link"
                >
                  Login Here &gt;&gt;&gt;
                </Link>
              </div>

              <button
                type="submit"
                disabled={submitting || !isPhoneValid || !isEmailValid || !isPasswordValid}
                className="auth-submit-btn"
              >
                {submitting ? "Creating Account..." : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
