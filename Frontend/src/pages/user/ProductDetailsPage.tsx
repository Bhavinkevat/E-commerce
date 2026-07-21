import { useEffect, useState } from "react";
import { CreditCard, Heart, ShoppingCart, Tag, Check, Copy } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import { addToCart, getProductDetails, toggleWishlist, getWishlist, listActiveCoupons } from "../../apis/user";
import type { Product, Coupon } from "../../types/catalog";
import { useToast } from "../../context/ToastContext";

function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string>("");
  const { showToast } = useToast();

  useEffect(() => {
    const id = Number(productId);
    if (!Number.isNaN(id)) {
      void getProductDetails(id).then((prod) => {
        if (prod) {
          setProduct(prod);
          setSelectedImage(prod.image_url);
          // Set initial size and color
          const sizes = prod.sizes ? prod.sizes.split(",").map((s) => s.trim()) : ["6", "7", "8", "9", "10"];
          const colors = prod.colors ? prod.colors.split(",").map((c) => c.trim()) : ["Black", "Navy", "Silver"];
          if (sizes.length > 0) setSelectedSize(sizes[0]);
          if (colors.length > 0) setSelectedColor(colors[0]);
        }
      });
      void getWishlist().then(setWishlist);
      void listActiveCoupons().then(setActiveCoupons);
    }
  }, [productId]);

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      const updatedWishlist = await toggleWishlist(product.id);
      const isAdded = updatedWishlist.some((item) => item.id === product.id);
      setWishlist(updatedWishlist);
      showToast(
        isAdded ? `${product.name} added to wishlist!` : `${product.name} removed from wishlist!`,
        "success"
      );
    } catch {
      showToast("Failed to update wishlist.", "error");
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Coupon code ${code} copied to clipboard! Apply it at checkout.`, "info");
    setTimeout(() => setCopiedCode(""), 3000);
  };

  if (!product) {
    return (
      <section className="panel-stack">
        <p className="eyebrow">User</p>
        <h1>Product Details</h1>
        <div className="info-card">
          <span>Product not found</span>
        </div>
      </section>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);
  const mrp = product.original_price && product.original_price > product.price ? product.original_price : product.price * 3 || 999;
  const discountPercent = Math.round(((mrp - product.price) / mrp) * 100);

  const availableSizes = product.sizes
    ? product.sizes.split(",").map((s) => s.trim()).filter(Boolean)
    : ["6", "7", "8", "9", "10"];

  const availableColors = product.colors
    ? product.colors.split(",").map((c) => c.trim()).filter(Boolean)
    : ["Black", "Navy", "Silver"];

  const galleryImages = product.gallery_images
    ? product.gallery_images.split(",").map((img) => img.trim()).filter(Boolean)
    : [product.image_url];

  return (
    <section className="panel-stack">
      <div className="product-details-container">
        {/* Left Column: Image Gallery */}
        <div className="details-gallery-column">
          <div className="main-image-viewport">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} className="main-details-img" />
            ) : (
              <div className="product-card-image-placeholder">No image preview</div>
            )}
            <button
              type="button"
              className={`wishlist-btn-floating ${isWishlisted ? "active" : ""}`}
              onClick={handleToggleWishlist}
              aria-label="Wishlist"
            >
              <Heart
                size={20}
                fill={isWishlisted ? "#ae4a34" : "none"}
                stroke={isWishlisted ? "#ae4a34" : "currentColor"}
              />
            </button>
          </div>

          <div className="gallery-thumbnails-strip">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`thumb-btn ${selectedImage === img ? "active" : ""}`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`Thumbnail ${idx}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Specifications & Checkout Actions */}
        <div className="details-info-column">
          <span className="product-brand-tag">{product.category}</span>
          <h1 className="details-product-title">{product.name}</h1>

          {/* Price Block */}
          <div className="details-price-card">
            {discountPercent > 0 && <span className="hot-deal-badge">↓ {discountPercent}% OFF</span>}
            <div className="price-values">
              <span className="details-net-price">₹{product.price.toLocaleString("en-IN")}</span>
              {mrp > product.price && (
                <span className="details-mrp-price">₹{mrp.toLocaleString("en-IN")}</span>
              )}
            </div>
          </div>

          {/* Color Selector */}
          <div className="selector-group">
            <label className="selector-label">
              Selected Color: <strong>{selectedColor}</strong>
            </label>
            <div className="chip-options">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`chip-button ${selectedColor === color ? "active" : ""}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="selector-group">
            <div className="label-with-link">
              <label className="selector-label">Select Size</label>
              <span className="size-chart-link">Size Chart</span>
            </div>
            <div className="chip-options">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`chip-button size-chip ${selectedSize === size ? "active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Active Coupons Deals Box */}
          {activeCoupons.length > 0 && (
            <div className="available-coupons-box">
              <div className="coupons-box-header">
                <Tag size={16} />
                <span>Available Offers & Coupons</span>
              </div>
              <div className="coupons-list">
                {activeCoupons.map((coupon) => (
                  <div key={coupon.id} className="coupon-item">
                    <div className="coupon-info">
                      <strong>{coupon.code}</strong>
                      <p>
                        Get{" "}
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% OFF`
                          : `₹${coupon.discount_value} OFF`}{" "}
                        {coupon.min_order_value > 0 ? `on min order ₹${coupon.min_order_value}` : "on any order"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="mini-button copy-coupon-btn"
                      onClick={() => copyCouponCode(coupon.code)}
                    >
                      {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                      {copiedCode === coupon.code ? "Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description & Specs */}
          <div className="details-description">
            <h3>Product Overview</h3>
            <p>{product.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="details-action-buttons">
            <Button
              type="button"
              variant="ghost"
              icon={<ShoppingCart size={18} />}
              onClick={async () => {
                await addToCart(product.id);
                showToast(`${product.name} (${selectedColor}, Size ${selectedSize}) added to cart!`, "success");
              }}
              style={{ flex: 1 }}
            >
              Add to Cart
            </Button>

            <Button
              type="button"
              variant="primary"
              icon={<CreditCard size={18} />}
              onClick={async () => {
                await addToCart(product.id);
                showToast(`Proceeding to checkout for ${product.name}!`, "success");
                navigate("/app/cart");
              }}
              style={{ flex: 1, backgroundColor: "#e65100", borderColor: "#e65100" }}
            >
              Buy Now at ₹{product.price.toLocaleString("en-IN")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
