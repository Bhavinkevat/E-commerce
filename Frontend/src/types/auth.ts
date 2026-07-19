export type AuthMode = "login" | "signup";

export interface User {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  role: "admin" | "user";
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
  role: "admin" | "user";
}

export interface ForgotPasswordPayload {
  email: string;
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordResetPayload extends ForgotPasswordPayload {
  otp: string;
}

