import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../apis/user";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Check, 
  Camera, 
  Upload, 
  Trash2, 
  Sparkles,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

// Luxury Preset Avatars
const PRESET_AVATARS = [
  { id: 1, name: "Royal Gold Crown", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Gentleman Suit", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Emerald Couture", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "High Fashion Model", url: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Diamond Elegance", url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "Vintage Luxury", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" }
];

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    password: "",
  });

  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || "");
  const [showPresetModal, setShowPresetModal] = useState<boolean>(false);
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
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  // Handle custom file upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        showToast("New profile picture loaded! Click Save to apply.", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
    showToast("Profile picture removed.", "info");
  };

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
      // Attach local avatar_url state
      updatedUser.avatar_url = avatarUrl;
      updateUser(updatedUser);

      showToast("Profile & Picture updated successfully!", "success");
      setSuccessMessage("Profile updated successfully!");
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel-stack animate-fade-in-up">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User Portal</p>
          <h1>My Profile Settings</h1>
        </div>
      </header>

      <div className="split-grid">
        {/* Left Side: Edit Form */}
        <div className="form-card">
          <h2 style={{ marginBottom: "20px" }}>Edit Personal Information</h2>
          
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
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <TextField
              label="Delivery Address"
              icon={<MapPin size={18} />}
              type="text"
              placeholder="123 Luxury Avenue, Mumbai, India"
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
                {saving ? "Saving Changes..." : "Save Profile & Picture"}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Side: Interactive Profile Avatar & Picture Upload Card */}
        <div className="form-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "12px 0" }}>
            
            {/* 📸 Animated Profile Picture Container */}
            <div className="profile-avatar-upload-box">
              <div className="avatar-image-frame animate-gold-pulse">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.name || "User Avatar"} className="avatar-img-preview" />
                ) : (
                  <div className="avatar-initials-fallback">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>

              {/* Upload Trigger Badge Icon */}
              <button
                type="button"
                className="avatar-camera-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Profile Picture"
              >
                <Camera size={18} />
              </button>

              {/* Hidden Native File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
            </div>

            <h2 style={{ margin: "16px 0 4px", fontSize: "1.4rem", color: "var(--text-white)" }}>
              {user?.name || "User"}
            </h2>
            <span style={{ color: "var(--gold-light)", fontSize: "0.92rem", fontWeight: "600" }}>{user?.email}</span>
            <span className="eyebrow" style={{ margin: "8px 0 0" }}>{user?.role || "user"}</span>

            {/* Profile Picture Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap", justifyContent: "center" }}>
              <button
                type="button"
                className="mini-button success"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Upload Device Photo
              </button>

              <button
                type="button"
                className="mini-button"
                onClick={() => setShowPresetModal(true)}
              >
                <Sparkles size={14} /> Choose Avatar
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  className="mini-button danger"
                  onClick={handleRemoveAvatar}
                  title="Remove Profile Picture"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--gold-border)", paddingTop: "20px" }}>
            <h4 style={{ margin: "0 0 14px", color: "var(--gold-bright)", textTransform: "uppercase", fontSize: "0.82rem", letterSpacing: "0.08em" }}>
              Account Information
            </h4>
            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <span style={{ display: "block", fontSize: "0.82rem", color: "var(--text-muted)" }}>Full Name</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-white)" }}>
                  {user?.first_name || user?.last_name 
                    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() 
                    : user?.name || "Not set"}
                </strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.82rem", color: "var(--text-muted)" }}>Phone Number</span>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-white)" }}>{user?.phone || "Not set"}</strong>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.82rem", color: "var(--text-muted)" }}>Shipping Address</span>
                <strong style={{ fontSize: "0.95rem", lineHeight: "1.4", display: "block", color: "var(--text-white)" }}>
                  {user?.address || "Not set"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🖼️ Preset Avatar Picker Modal */}
      {showPresetModal && (
        <div className="modal-overlay" onClick={() => setShowPresetModal(false)}>
          <div className="modal-container animate-fade-in-scale" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="var(--gold-primary)" /> Select Luxury Avatar
              </h3>
              <button
                type="button"
                className="toast-close"
                onClick={() => setShowPresetModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Choose a curated luxury avatar portrait for your profile:
              </p>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
                {PRESET_AVATARS.map((preset) => (
                  <div
                    key={preset.id}
                    className="preset-avatar-option"
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      setShowPresetModal(false);
                      showToast(`Selected "${preset.name}" avatar! Click Save to apply.`, "info");
                    }}
                  >
                    <img src={preset.url} alt={preset.name} />
                    <span>{preset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
