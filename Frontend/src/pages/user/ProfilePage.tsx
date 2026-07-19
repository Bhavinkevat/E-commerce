import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../apis/user";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import { User as UserIcon, Mail, Phone, MapPin, Lock, Check } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        password: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload: any = {
        name: formData.name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const updatedUser = await updateProfile(payload);
      updateUser(updatedUser);
      showToast("Profile updated successfully!", "success");
      setSuccessMessage("Profile updated successfully!");
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Profile</h1>
        </div>
      </header>

      <div className="split-grid">
        {/* Left Side: Edit Form */}
        <div className="form-card">
          <h2 style={{ marginBottom: "20px" }}>Edit Profile</h2>
          
          {error && (
            <div className="feedback error" style={{ marginBottom: "16px" }}>
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="feedback success" style={{ marginBottom: "16px" }}>
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <TextField
                label="First Name"
                icon={<UserIcon size={18} />}
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              <TextField
                label="Last Name"
                icon={<UserIcon size={18} />}
                type="text"
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>

            <TextField
              label="Display Name"
              icon={<UserIcon size={18} />}
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="Email Address"
              icon={<Mail size={18} />}
              type="email"
              required
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <TextField
              label="Phone Number"
              icon={<Phone size={18} />}
              type="tel"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <TextField
              label="Delivery Address"
              icon={<MapPin size={18} />}
              type="text"
              placeholder="123 Main St, City, Country"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <TextField
              label="Change Password (leave blank to keep current)"
              icon={<Lock size={18} />}
              type="password"
              showPasswordToggle
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <div style={{ marginTop: "12px" }}>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                icon={<Check size={16} />}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Profile Summary Card */}
        <div className="form-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "12px 0" }}>
            <div className="avatar" style={{ width: "96px", height: "96px", borderRadius: "50%", fontSize: "2.4rem", display: "grid", placeItems: "center", marginBottom: "16px", background: "#1f6f59" }}>
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <h2 style={{ margin: "0 0 4px" }}>{user?.name || "User"}</h2>
            <span style={{ color: "#516057", fontSize: "0.95rem" }}>{user?.email}</span>
            <span className="eyebrow" style={{ margin: "12px 0 0" }}>{user?.role || "user"}</span>
          </div>

          <div style={{ borderTop: "1px solid #e6ece5", paddingTop: "20px" }}>
            <h4 style={{ margin: "0 0 12px", color: "#516057", textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em" }}>Account Info</h4>
            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.82rem", color: "#7a877f" }}>Full Name</span>
                <strong style={{ fontSize: "0.95rem" }}>
                  {user?.first_name || user?.last_name 
                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() 
                    : user?.name || "Not set"}
                </strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.82rem", color: "#7a877f" }}>Phone Number</span>
                <strong style={{ fontSize: "0.95rem" }}>{user?.phone || "Not set"}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.82rem", color: "#7a877f" }}>Shipping Address</span>
                <strong style={{ fontSize: "0.95rem", lineHeight: "1.4", display: "block" }}>{user?.address || "Not set"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;

