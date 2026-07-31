import { useEffect, useState } from "react";
import { Plus, Shield, UserPlus, CheckCircle, Save, ShieldCheck } from "lucide-react";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { useToast } from "../../context/ToastContext";
import { createRole, createStaffUser, listRoles, listStaffUsers, updateRolePermissions } from "../../apis/role";
import type { Role, RolePermission, StaffUser } from "../../types/role";

const ALL_MODULES = [
  "Products",
  "Coupons",
  "Orders",
  "Customers",
  "Analytics",
  "Role & Permissions",
];

function RolesPage() {
  const [activeTab, setActiveTab] = useState<"roles" | "users" | "permissions">("roles");
  const [roles, setRoles] = useState<Role[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  
  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Role Form
  const [roleForm, setRoleForm] = useState({ name: "", description: "" });
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState("");

  // Staff User Form
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role_name: "" });
  const [userSaving, setUserSaving] = useState(false);
  const [userError, setUserError] = useState("");

  // Permissions Matrix Tab State
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [matrixPermissions, setMatrixPermissions] = useState<Record<string, { can_view: boolean; can_create: boolean; can_update: boolean; can_delete: boolean }>>({});
  const [savingMatrix, setSavingMatrix] = useState(false);

  const { showToast } = useToast();

  const loadData = async () => {
    try {
      const rolesData = await listRoles();
      setRoles(rolesData);
      const staffData = await listStaffUsers();
      setStaffUsers(staffData);

      if (rolesData.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rolesData[0].id);
        populateMatrix(rolesData[0]);
      }
    } catch {
      showToast("Failed to load roles data", "error");
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const populateMatrix = (role: Role) => {
    const permMap: Record<string, { can_view: boolean; can_create: boolean; can_update: boolean; can_delete: boolean }> = {};
    
    // Initialize default for all modules
    ALL_MODULES.forEach((mod) => {
      permMap[mod] = { can_view: true, can_create: false, can_update: false, can_delete: false };
    });

    if (role.permissions) {
      role.permissions.forEach((p) => {
        permMap[p.module_name] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_update: p.can_update,
          can_delete: p.can_delete,
        };
      });
    }

    setMatrixPermissions(permMap);
  };

  const handleRoleSelect = (roleId: number) => {
    setSelectedRoleId(roleId);
    const target = roles.find((r) => r.id === roleId);
    if (target) {
      populateMatrix(target);
    }
  };

  const handleCheckboxChange = (moduleName: string, action: "can_view" | "can_create" | "can_update" | "can_delete") => {
    const selectedRole = roles.find((r) => r.id === selectedRoleId);
    if (selectedRole?.name.toLowerCase() === "super admin" || selectedRole?.name.toLowerCase() === "admin") {
      return; // Super admin permissions are locked to ALL enabled
    }

    setMatrixPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: !prev[moduleName]?.[action],
      },
    }));
  };

  const submitRole = async () => {
    if (!roleForm.name.trim()) {
      setRoleError("Role name is required");
      return;
    }
    setRoleError("");
    setRoleSaving(true);

    try {
      await createRole(roleForm);
      showToast(`Role "${roleForm.name}" created successfully!`, "success");
      setIsRoleModalOpen(false);
      setRoleForm({ name: "", description: "" });
      await loadData();
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : "Failed to create role");
    } finally {
      setRoleSaving(false);
    }
  };

  const submitStaffUser = async () => {
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password.trim() || !userForm.role_name.trim()) {
      setUserError("All fields are required");
      return;
    }
    setUserError("");
    setUserSaving(true);

    try {
      await createStaffUser(userForm);
      showToast(`Staff User "${userForm.name}" created!`, "success");
      setIsUserModalOpen(false);
      setUserForm({ name: "", email: "", password: "", role_name: "" });
      await loadData();
    } catch (err) {
      setUserError(err instanceof Error ? err.message : "Failed to create staff user");
    } finally {
      setUserSaving(false);
    }
  };

  const savePermissionsMatrix = async () => {
    if (!selectedRoleId) return;
    setSavingMatrix(true);

    const payload = ALL_MODULES.map((mod) => ({
      module_name: mod,
      can_view: matrixPermissions[mod]?.can_view ?? true,
      can_create: matrixPermissions[mod]?.can_create ?? false,
      can_update: matrixPermissions[mod]?.can_update ?? false,
      can_delete: matrixPermissions[mod]?.can_delete ?? false,
    }));

    try {
      await updateRolePermissions(selectedRoleId, payload);
      showToast("Permissions updated successfully!", "success");
      await loadData();
    } catch {
      showToast("Could not update permissions", "error");
    } finally {
      setSavingMatrix(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const isSuperAdminRole = selectedRole?.name.toLowerCase() === "super admin" || selectedRole?.name.toLowerCase() === "admin";

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin Security</p>
          <h1>Role & Permissions</h1>
        </div>

        <div className="subnav-tabs">
          <button
            type="button"
            className={`subnav-tab ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            <Shield size={16} /> Roles List
          </button>
          <button
            type="button"
            className={`subnav-tab ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <UserPlus size={16} /> User Creation
          </button>
          <button
            type="button"
            className={`subnav-tab ${activeTab === "permissions" ? "active" : ""}`}
            onClick={() => setActiveTab("permissions")}
          >
            <ShieldCheck size={16} /> Role Permissions
          </button>
        </div>
      </header>

      {/* TAB 1: ROLES MANAGEMENT */}
      {activeTab === "roles" && (
        <div className="tab-content">
          <div className="section-toolbar">
            <p className="section-description">
              Create and manage system roles to define staff responsibilities.
            </p>
            <Button
              variant="ghost"
              icon={<Plus size={18} />}
              onClick={() => {
                setRoleForm({ name: "", description: "" });
                setRoleError("");
                setIsRoleModalOpen(true);
              }}
              type="button"
            >
              New Role
            </Button>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      No roles created yet.
                    </td>
                  </tr>
                ) : (
                  roles.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span className="role-chip">{r.name}</span>
                      </td>
                      <td>{r.description || "N/A"}</td>
                      <td>
                        <span className="status-tag active">Active</span>
                      </td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USER CREATION */}
      {activeTab === "users" && (
        <div className="tab-content">
          <div className="section-toolbar">
            <p className="section-description">
              Register new admin & staff users and assign them specific roles.
            </p>
            <Button
              variant="ghost"
              icon={<UserPlus size={18} />}
              onClick={() => {
                setUserForm({
                  name: "",
                  email: "",
                  password: "",
                  role_name: roles[0]?.name || "Manager",
                });
                setUserError("");
                setIsUserModalOpen(true);
              }}
              type="button"
            >
              Create New User
            </Button>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Email</th>
                  <th>Assigned Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      No staff users registered yet.
                    </td>
                  </tr>
                ) : (
                  staffUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="category-badge">{u.role}</span>
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE PERMISSIONS MATRIX */}
      {activeTab === "permissions" && (
        <div className="tab-content">
          <div className="matrix-role-selector">
            <label htmlFor="role-matrix-select" className="filter-label">Select Role to Edit Permissions:</label>
            <select
              id="role-matrix-select"
              className="admin-select"
              value={selectedRoleId || ""}
              onChange={(e) => handleRoleSelect(Number(e.target.value))}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>

            {isSuperAdminRole && (
              <span className="admin-lock-badge">
                <CheckCircle size={16} /> Super Admin has unrestricted permissions across all menus.
              </span>
            )}
          </div>

          <div className="table-card">
            <table className="data-table matrix-table">
              <thead>
                <tr>
                  <th>Menu / Module</th>
                  <th className="text-center">View 👁️</th>
                  <th className="text-center">Create ➕</th>
                  <th className="text-center">Update ✏️</th>
                  <th className="text-center">Delete 🗑️</th>
                </tr>
              </thead>
              <tbody>
                {ALL_MODULES.map((mod) => {
                  const perm = matrixPermissions[mod] || {
                    can_view: true,
                    can_create: false,
                    can_update: false,
                    can_delete: false,
                  };

                  return (
                    <tr key={mod}>
                      <td>
                        <strong>{mod}</strong>
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="permission-checkbox"
                          checked={isSuperAdminRole ? true : perm.can_view}
                          disabled={isSuperAdminRole}
                          onChange={() => handleCheckboxChange(mod, "can_view")}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="permission-checkbox"
                          checked={isSuperAdminRole ? true : perm.can_create}
                          disabled={isSuperAdminRole}
                          onChange={() => handleCheckboxChange(mod, "can_create")}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="permission-checkbox"
                          checked={isSuperAdminRole ? true : perm.can_update}
                          disabled={isSuperAdminRole}
                          onChange={() => handleCheckboxChange(mod, "can_update")}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="permission-checkbox"
                          checked={isSuperAdminRole ? true : perm.can_delete}
                          disabled={isSuperAdminRole}
                          onChange={() => handleCheckboxChange(mod, "can_delete")}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isSuperAdminRole && (
            <div className="matrix-save-bar">
              <Button
                type="button"
                icon={<Save size={18} />}
                onClick={savePermissionsMatrix}
                disabled={savingMatrix}
              >
                {savingMatrix ? "Saving Permissions..." : "Save Role Permissions"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {isRoleModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRoleModalOpen(false)}>
          <div
            className="modal-container"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <h2 className="modal-title">Create New Role</h2>
              <button
                type="button"
                className="mini-button"
                onClick={() => setIsRoleModalOpen(false)}
              >
                &times;
              </button>
            </header>

            <div className="modal-body">
              <div className="form-grid" style={{ margin: 0 }}>
                <TextField
                  label="Role Title"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  placeholder="e.g. Store Manager, Support Agent"
                />
                <TextField
                  label="Description (Optional)"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  placeholder="Role responsibilities overview (optional)"
                />
              </div>
              {roleError && <div className="feedback error">{roleError}</div>}

            </div>

            <footer className="modal-footer">
              <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitRole} disabled={roleSaving}>
                {roleSaving ? "Creating..." : "Save Role"}
              </Button>
            </footer>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {isUserModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUserModalOpen(false)}>
          <div
            className="modal-container"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <h2 className="modal-title">Create Staff User</h2>
              <button
                type="button"
                className="mini-button"
                onClick={() => setIsUserModalOpen(false)}
              >
                &times;
              </button>
            </header>

            <div className="modal-body">
              <div className="form-grid" style={{ margin: 0 }}>
                <TextField
                  label="Full Name"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Staff member name"
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="staff@gahena.com"
                />
                <TextField
                  label="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Secure password"
                />
                <div className="form-field-custom">
                  <label className="field-label" htmlFor="user-role-select">
                    Assign Role
                  </label>
                  <select
                    id="user-role-select"
                    className="modal-select-input"
                    value={userForm.role_name}
                    onChange={(e) => setUserForm({ ...userForm, role_name: e.target.value })}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {userError && <div className="feedback error">{userError}</div>}
            </div>

            <footer className="modal-footer">
              <Button variant="ghost" onClick={() => setIsUserModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitStaffUser} disabled={userSaving}>
                {userSaving ? "Creating User..." : "Create User"}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default RolesPage;
