import { ArrowRight, Lock, Mail, Shield, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { useAuth } from "../../context/AuthContext";

function SignupPage() {
  const { signupAsUser, submitting, error, message, clearFeedback } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  return (
    <main className="auth-shell">
      <section className="auth-layout">
        <div className="auth-copy">
          <div className="brand-mark large">
            <Shield size={28} />
          </div>
          <p className="eyebrow">Gahena</p>
          <h1>Sign Up</h1>
          <p className="summary">
            New account banao. Default role user hoga; admin access ke liye role
            DB me promote kiya jaata hai.
          </p>
          <div className="feature-list">
            <div>
              <UserPlus size={18} />
              <span>Clean signup flow</span>
            </div>
            <div>
              <Lock size={18} />
              <span>Hashed passwords</span>
            </div>
          </div>
        </div>

        <section className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <Link className="tab" to="/login" onClick={clearFeedback}>
              Login
            </Link>
            <button type="button" className="tab active">
              Sign Up
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              signupAsUser({ name, email, password, role });
            }}
          >
            <TextField
              label="Name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                clearFeedback();
              }}
              placeholder="Bhavin"
              icon={<UserPlus size={18} />}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFeedback();
              }}
              placeholder="bhavin@example.com"
              icon={<Mail size={18} />}
              required
            />
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
              required
              minLength={6}
            />

            <label className="field">
              <span>Role</span>
              <div className="role-switch">
                <button
                  type="button"
                  className={role === "user" ? "role-pill active" : "role-pill"}
                  onClick={() => {
                    setRole("user");
                    clearFeedback();
                  }}
                >
                  User
                </button>
                <button
                  type="button"
                  className={role === "admin" ? "role-pill active" : "role-pill"}
                  onClick={() => {
                    setRole("admin");
                    clearFeedback();
                  }}
                >
                  Admin
                </button>
              </div>
            </label>

            {error ? <div className="feedback error">{error}</div> : null}
            {message ? <div className="feedback success">{message}</div> : null}

            <Button type="submit" icon={<ArrowRight size={18} />} disabled={submitting}>
              {submitting ? "Please wait..." : "Create account"}
            </Button>
          </form>
        </section>
      </section>
    </main>
  );
}

export default SignupPage;
