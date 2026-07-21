import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import TextField from "../../components/common/TextField";
import { listProducts, removeProduct, saveProduct } from "../../apis/admin";
import type { Product } from "../../types/catalog";

const emptyForm = {
  id: undefined as number | undefined,
  name: "",
  category: "",
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
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!form.name.trim() || !form.category.trim()) {
      setFormError("Name and category are required.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      await saveProduct(form);
      closeModal();
      await refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Product Management</h1>
        </div>
        <Button
          variant="ghost"
          icon={<Plus size={18} />}
          onClick={() => {
            setForm(emptyForm);
            setImageError("");
            setFormError("");
            setIsModalOpen(true);
          }}
          type="button"
        >
          New Product
        </Button>
      </header>

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
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">
                  No products yet. Click &quot;New Product&quot; to add one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
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
                  <td>{product.category}</td>
                  <td>₹{product.price.toLocaleString("en-IN")}</td>
                  <td>{product.stock}</td>
                  <td>{product.status}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="mini-button"
                        onClick={() => {
                          setForm({
                            id: product.id,
                            name: product.name,
                            category: product.category,
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
                          setImageError("");
                          setFormError("");
                          setIsModalOpen(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
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
                <TextField
                  label="Category"
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  placeholder="Category e.g. Shoes, Jewelry"
                />
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
