import { API_URL } from "./auth";
import type { Role, RoleCreatePayload, RolePermission, StaffUser, StaffUserCreatePayload } from "../types/role";

const token = () => localStorage.getItem("gahena_token") || "";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
      "ngrok-skip-browser-warning": "true",
      ...(init?.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data as T;
}

export async function listRoles(): Promise<Role[]> {
  return requestJson<Role[]>("/admin/roles");
}

export async function createRole(payload: RoleCreatePayload): Promise<Role> {
  return requestJson<Role>("/admin/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRolePermissions(
  roleId: number,
  permissions: Omit<RolePermission, "id" | "role_id">[]
): Promise<Role> {
  return requestJson<Role>(`/admin/roles/${roleId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
}

export async function listStaffUsers(): Promise<StaffUser[]> {
  return requestJson<StaffUser[]>("/admin/roles/staff");
}

export async function createStaffUser(payload: StaffUserCreatePayload): Promise<StaffUser> {
  return requestJson<StaffUser>("/admin/roles/staff", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
