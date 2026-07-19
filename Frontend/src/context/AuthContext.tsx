/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser, login, signup } from "../apis/auth";
import type { AuthMode, LoginPayload, SignupPayload, User } from "../types/auth";

type AuthContextValue = {
  user: User | null;
  token: string;
  loading: boolean;
  submitting: boolean;
  error: string;
  message: string;
  loginAsUser: (payload: LoginPayload) => Promise<void>;
  signupAsUser: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  clearFeedback: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(localStorage.getItem("gahena_token") || "");
  const [loading, setLoading] = useState(Boolean(token));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch {
        localStorage.removeItem("gahena_token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [token]);

  const clearFeedback = () => {
    setError("");
    setMessage("");
  };

  const runAuth = async (
    action: () => Promise<{ access_token: string; user: User }>,
    successMessage: string
  ) => {
    setSubmitting(true);
    clearFeedback();

    try {
      const response = await action();
      localStorage.setItem("gahena_token", response.access_token);
      setToken(response.access_token);
      setUser(response.user);
      setMessage(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const loginAsUser = async (payload: LoginPayload) => {
    await runAuth(() => login(payload), "Login successful");
  };

  const signupAsUser = async (payload: SignupPayload) => {
    await runAuth(() => signup(payload), "Account created successfully");
  };

  const logout = () => {
    localStorage.removeItem("gahena_token");
    setToken("");
    setUser(null);
    setError("");
    setMessage("");
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    submitting,
    error,
    message,
    loginAsUser,
    signupAsUser,
    logout,
    clearFeedback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
