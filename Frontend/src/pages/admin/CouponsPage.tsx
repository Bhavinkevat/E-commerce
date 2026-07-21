import { useEffect, useState } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { createCouponAdmin, deleteCouponAdmin, listCouponsAdmin } from "../../apis/admin";
import type { Coupon } from "../../types/catalog";
import { useToast } from "../../context/ToastContext";

const emptyCouponForm = {
  code: "",
  discount_type: "percentage" as "percentage" | "flat",
  discount_value: 10,
  min_order_value: 0,
  max_discount_amount: undefined as number | undefined,
  is_active: true,
};

function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState(emptyCouponForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const refresh = async () => {
    try {
      const data = await listCouponsAdmin();
      setCoupons(data);
    } catch {
      showToast("Failed to fetch coupons", "error");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const handleCreate = async () => {
    if (!form.code.trim()) {
      setError("Coupon code is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await createCouponAdmin({
        code: form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_value: Number(form.min_order_value),
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : undefined,
        is_active: form.is_active,
      });
      showToast(`Coupon ${form.code.toUpperCase()} created successfully!`, "success");
      setIsModalOpen(false);
      setForm(emptyCouponForm);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, code: string) => {
    try {
      await deleteCouponAdmin(id);
      showToast(`Coupon ${code} deleted.`, "success");
      await refresh();
    } catch {
      showToast("Failed to delete coupon.", "error");
    }
  };

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Coupons & Promo Codes</h1>
        </div>
        <Button
          variant="ghost"
          icon={<Plus size={18} />}
          onClick={() => {
            setForm(emptyCouponForm);
            setError("");
            setIsModalOpen(true);
          }}
          type="button"
        >
          New Coupon
        </Button>
      </header>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-empty">
                  No active coupons. Click &quot;New Coupon&quot; to create one.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td style={{ fontWeight: 600, color: "var(--accent-color, #ae4a34)" }}>
                    <Tag size={14} style={{ display: "inline-block", marginRight: 6, verticalAlign: "middle" }} />
                    {coupon.code}
                  </td>
                  <td>{coupon.discount_type === "percentage" ? "Percentage (% OFF)" : "Flat Amount (₹ OFF)"}</td>
                  <td>
                    <strong>
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}% OFF`
                        : `₹${coupon.discount_value} OFF`}
                    </strong>
                  </td>
                  <td>₹{coupon.min_order_value}</td>
                  <td>
                    <span className={`status-tag ${coupon.is_active ? "active" : "inactive"}`}>
                      {coupon.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="mini-button danger"
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <header className="modal-header">
              <h2 className="modal-title">Create New Coupon</h2>
              <button
                type="button"
                className="mini-button"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </header>

            <div className="modal-body">
              <div className="form-grid" style={{ margin: 0 }}>
                <TextField
                  label="Coupon Code (e.g. FESTIVE25)"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="WELCOME25"
                />

                <div className="form-field">
                  <label className="field-label">Discount Type</label>
                  <select
                    className="text-field-input"
                    value={form.discount_type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discount_type: e.target.value as "percentage" | "flat",
                      })
                    }
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <TextField
                  label={form.discount_type === "percentage" ? "Discount Percentage (%)" : "Flat Discount Amount (₹)"}
                  type="number"
                  value={String(form.discount_value)}
                  onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                />

                <TextField
                  label="Minimum Order Value (₹)"
                  type="number"
                  value={String(form.min_order_value)}
                  onChange={(e) => setForm({ ...form, min_order_value: Number(e.target.value) })}
                  placeholder="0 for no limit"
                />
              </div>
              {error ? <div className="feedback error">{error}</div> : null}
            </div>

            <footer className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreate} disabled={saving}>
                {saving ? "Creating..." : "Create Coupon"}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default CouponsPage;
