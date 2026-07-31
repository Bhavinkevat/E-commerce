export interface RolePermission {
  id: number;
  role_id: number;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  created_at: string;
  permissions: RolePermission[];
}

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface RoleCreatePayload {
  name: string;
  description: string;
}

export interface StaffUserCreatePayload {
  name: string;
  email: string;
  password: string;
  role_name: string;
}
