import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { listProducts, removeProduct, saveProduct } from "../../apis/admin";
import type { Product } from "../../types/catalog";
import { useAuth } from "../../context/AuthContext";

const STANDARD_CATEGORIES = [
  "Men's Clothes",
  "Women's Clothes",
  "Men's Footwear",
  "Women's Footwear",
  "Jewellery",
];

const emptyForm = {
  id: undefined as number | undefined,
  name: "",
  category: "Men's Clothes",
  customCategory: "",
  price: 0,
  original_price: 0,
  sizes: "6, 7, 8, 9, 10",
  colors: "Black, Blue, Navy",
  gallery_images: "",
  stock: 10,
  rating: 4.5,
  status: "Active" as "Active" | "Draft",
  description: "",
  image_url: "",
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Admin Table Filter States
  const [adminSearch, setAdminSearch] = useState("");
  const [adminCategory, setAdminCategory] = useState("All");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSuperAdmin = !user || user.role.toLowerCase() === "admin" || user.role.toLowerCase() === "super admin";
  const perm = user?.permissions?.["Products"];
  const canCreate = isSuperAdmin || (perm ? perm.can_create : true);
  const canUpdate = isSuperAdmin || (perm ? perm.can_update : true);
  const canDelete = isSuperAdmin || (perm ? perm.can_delete : true);

  const refresh = async () => {
    setProducts(await listProducts());
  };

  useEffect(() => {
    void listProducts().then(setProducts);
  }, []);

  const title = useMemo(
    () => (form.id ? "Edit Product" : "Add Product"),
    [form.id]
  );

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
    setIsCustomCat(false);
    setImageError("");
    setFormError("");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must be smaller than 2 MB.");
      return;
    }

    setImageError("");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image_url: typeof reader.result === "string" ? reader.result : "",
      }));
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    const finalCategory = isCustomCat ? form.customCategory.trim() : form.category;
    if (!form.name.trim() || !finalCategory) {
      setFormError("Name and category are required.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      await saveProduct({
        ...form,
        category: finalCategory,
      });
      closeModal();
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = adminSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q);

      const matchesCategory =
        adminCategory === "All" ||
        product.category === adminCategory ||
        (adminCategory === "Men's Footwear" && product.category === "Footwear") ||
        (adminCategory === "Women's Footwear" && product.category === "Footwear");

      return matchesSearch && matchesCategory;
    });
  }, [products, adminSearch, adminCategory]);

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Product Management</h1>
        </div>
        {canCreate && (
          <Button
            variant="ghost"
            icon={<Plus size={18} />}
            onClick={() => {
              setForm(emptyForm);
              setIsCustomCat(false);
              setImageError("");
              setFormError("");
              setIsModalOpen(true);
            }}
            type="button"
          >
            New Product
          </Button>
        )}
      </header>

      {/* Admin Search & Category Filter Control Bar */}
      <div className="admin-filter-toolbar">
        <div className="product-search-wrapper admin-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="product-search-input"
            placeholder="Filter products by name or category..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
          />
          {adminSearch && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setAdminSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="admin-category-filter">
          <label htmlFor="admin-cat-select" className="filter-label">Category:</label>
          <select
            id="admin-cat-select"
            className="admin-select"
            value={adminCategory}
            onChange={(e) => setAdminCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {STANDARD_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  {products.length === 0
                    ? 'No products yet. Click "New Product" to add one.'
                    : "No products match current search or category filter."}
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table-thumb">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <span className="table-thumb-placeholder">No image</span>
                      )}
                    </div>
                  </td>
                  <td>{product.name}</td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td>₹{product.price.toLocaleString("en-IN")}</td>
                  <td>{product.stock}</td>
                  <td>{product.status}</td>
                  <td>
                    <div className="row-actions">
                      {canUpdate && (
                        <button
                          type="button"
                          className="mini-button"
                          onClick={() => {
                            const isKnown = STANDARD_CATEGORIES.includes(product.category);
                            setForm({
                              id: product.id,
                              name: product.name,
                              category: isKnown ? product.category : "Other",
                              customCategory: isKnown ? "" : product.category,
                              price: product.price,
                              original_price: product.original_price || 0,
                              sizes: product.sizes || "6, 7, 8, 9, 10",
                              colors: product.colors || "Black, Blue, Navy",
                              gallery_images: product.gallery_images || "",
                              stock: product.stock,
                              rating: product.rating,
                              status: product.status,
                              description: product.description,
                              image_url: product.image_url,
                            });
                            setIsCustomCat(!isKnown);
                            setImageError("");
                            setFormError("");
                            setIsModalOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          className="mini-button danger"
                          onClick={async () => {
                            await removeProduct(product.id);
                            await refresh();
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {!canUpdate && !canDelete && (
                        <span style={{ fontSize: "0.8rem", color: "#888" }}>Read Only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-container"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <h2 id="product-modal-title" className="modal-title">
                {title}
              </h2>
              <button
                type="button"
                className="mini-button"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </header>

            <div className="modal-body">
              <div className="form-grid" style={{ margin: 0 }}>
                <div className="image-upload-field">
                  <span className="field-label">Product Image</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="image-upload-input"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    className="image-upload-trigger"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus size={18} />
                    {form.image_url ? "Change Image" : "Upload Image"}
                  </button>
                  {imageError && <p className="field-error">{imageError}</p>}
                  {form.image_url && (
                    <div className="image-upload-preview">
                      <img src={form.image_url} alt="Product preview" />
                    </div>
                  )}
                </div>

                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Product name"
                />

                <div className="form-field-custom">
                  <label className="field-label" htmlFor="modal-cat-select">
                    Category
                  </label>
                  <select
                    id="modal-cat-select"
                    className="modal-select-input"
                    value={isCustomCat ? "Other" : form.category}
                    onChange={(event) => {
                      const val = event.target.value;
                      if (val === "Other") {
                        setIsCustomCat(true);
                        setForm({ ...form, category: "Other" });
                      } else {
                        setIsCustomCat(false);
                        setForm({ ...form, category: val });
                      }
                    }}
                  >
                    {STANDARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Other (Custom)</option>
                  </select>
                </div>

                {isCustomCat && (
                  <TextField
                    label="Custom Category Name"
                    value={form.customCategory}
                    onChange={(event) =>
                      setForm({ ...form, customCategory: event.target.value })
                    }
                    placeholder="e.g. Accessories, Cosmetics"
                  />
                )}

                <TextField
                  label="Selling Price (₹)"
                  type="number"
                  value={String(form.price)}
                  onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                />
                <TextField
                  label="MRP / Original Price (₹)"
                  type="number"
                  value={String(form.original_price)}
                  onChange={(event) => setForm({ ...form, original_price: Number(event.target.value) })}
                  placeholder="e.g. 999 for discount display"
                />
                <TextField
                  label="Available Sizes (Comma separated)"
                  value={form.sizes}
                  onChange={(event) => setForm({ ...form, sizes: event.target.value })}
                  placeholder="e.g. 6, 7, 8, 9, 10 or S, M, L"
                />
                <TextField
                  label="Available Colors (Comma separated)"
                  value={form.colors}
                  onChange={(event) => setForm({ ...form, colors: event.target.value })}
                  placeholder="e.g. Black, Blue, Navy"
                />
                <TextField
                  label="Stock"
                  type="number"
                  value={String(form.stock)}
                  onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
                />
                <TextField
                  label="Description"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Product description and highlights"
                />
              </div>
              {formError ? <div className="feedback error">{formError}</div> : null}
            </div>

            <footer className="modal-footer">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
              >
                Cancel
              </Button>
              <Button type="button" onClick={submit} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductsPage;

