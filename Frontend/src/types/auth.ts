export type AuthMode = "login" | "signup";

export interface PermissionItem {
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface User {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  permissions?: Record<string, PermissionItem>;
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
  phone: string;
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

