import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  SignupPayload,
  User,
} from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }

  return data as T;
}

export function signup(payload: SignupPayload): Promise<AuthResponse> {
  return requestJson<AuthResponse>("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<{ message: string }> {
  return requestJson<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token: string): Promise<User> {
  return requestJson<User>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export { API_URL };

