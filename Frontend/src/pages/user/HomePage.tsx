import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart,
  Star,
  Tag,
  ChevronRight
} from "lucide-react";
import { listProducts, toggleWishlist, getWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";
import { useToast } from "../../context/ToastContext";

// Circular Category Avatars (Men's, Women's, Kids', Jewellery, Footwear)
const CATEGORY_AVATARS = [
  { name: "Men's Shirts", cat: "Men's Shirts", img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=300&q=80" },
  { name: "Men's T-Shirts", cat: "Men's T-Shirts", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80" },
  { name: "Men's Footwear", cat: "Men's Footwear", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80" },
  { name: "Women's Kurtis", cat: "Women's Kurtis", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80" },
  { name: "Women's Footwear", cat: "Women's Footwear", img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80" },
  { name: "Jewellery", cat: "Jewellery", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80" },
  { name: "Kids' Wear", cat: "Kids' Wear", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=300&q=80" },
  { name: "Kids' Footwear", cat: "Kids' Footwear", img: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=300&q=80" },
];

// Steal Drips Deal Cards (Matching Screenshot 2)
const STEAL_DRIPS_DEALS = [
  { name: "Men's Sneakers & Shoes", tag: "Starting From ₹699", cat: "Men's Footwear", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80" },
  { name: "Women's Heels & Flats", tag: "Under ₹599", cat: "Women's Footwear", img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80" },
  { name: "Women's Kurtis", tag: "Under ₹699", cat: "Women's Kurtis", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80" },
  { name: "Kids' Shoes & Sandals", tag: "Under ₹399", cat: "Kids' Footwear", img: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=500&q=80" },
  { name: "Men's Trackpants", tag: "Starting From ₹599", cat: "Men's Trackpants", img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=500&q=80" },
  { name: "Luxury Jewellery", tag: "Under ₹999", cat: "Jewellery", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80" },
];

// For You Recommendation Items
const FOR_YOU_ITEMS = [
  { title: "Men's T-Shirts", cat: "Men's T-Shirts", img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=500&q=80" },
  { title: "Women's Kurtis", cat: "Women's Kurtis", img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=500&q=80" },
  { title: "Kids' Shirts & Pants", cat: "Kids' Wear", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=80" },
  { title: "Women's Jeans", cat: "Women's Jeans", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80" },
  { title: "Fine Gold & Silver", cat: "Jewellery", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=500&q=80" },
];

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    void listProducts().then((prods) => setFeaturedProducts(prods));
    void getWishlist().then(setWishlist);
  }, []);

  const isWishlisted = (productId: number) => {
    return wishlist.some((item) => item.id === productId);
  };

  const handleToggleWishlist = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.stopPropagation();
    try {
      const updatedWishlist = await toggleWishlist(productId);
      const isAdded = updatedWishlist.some((item) => item.id === productId);
      setWishlist(updatedWishlist);
      showToast(
        isAdded ? `${productName} added to wishlist!` : `${productName} removed from wishlist!`,
        "success"
      );
    } catch {
      showToast("Failed to update wishlist.", "error");
    }
  };

  return (
    <div className="storefront-home-page">
      {/* 🌟 1. Full-Width Hero Slider Banner (Matching Screenshot 1 top) */}
      <section className="storefront-hero-slider">
        <div className="hero-slide-main">
          <div className="hero-slide-copy">
            <span className="hero-slide-badge">PARTY MODE: ON</span>
            <h1 className="hero-slide-headline">FESTIVE & PARTY WEAR COLLECTION</h1>
            <p className="hero-slide-price">Starting from <strong>₹499</strong></p>
            <button
              type="button"
              className="hero-slide-cta"
              onClick={() => navigate("/app/products")}
            >
              SHOP NOW <ArrowRight size={18} />
            </button>
          </div>
          <div className="hero-slide-images">
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
              alt="Party Wear High Fashion"
              className="hero-slide-img-1"
            />
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"
              alt="Party Collection Model"
              className="hero-slide-img-2"
            />
          </div>
        </div>
      </section>

      {/* 🚚 2. Trust Strip & Coupon Banner (Matching Screenshot 1 middle) */}
      <section className="storefront-trust-coupon-strip">
        <div className="trust-info-bar">
          <div className="trust-info-item">
            <Truck size={20} className="trust-icon" />
            <div>
              <strong>Free Shipping</strong>
              <span>On all orders nationwide</span>
            </div>
          </div>
          <div className="trust-divider" />
          <div className="trust-info-item">
            <RotateCcw size={20} className="trust-icon" />
            <div>
              <strong>Easy Returns</strong>
              <span>No questions asked policy</span>
            </div>
          </div>
        </div>

        {/* Coupon Voucher Strip */}
        <div className="coupon-voucher-banner">
          <div className="voucher-left">
            <Tag size={20} className="voucher-icon" />
            <div>
              <h3>Get 15% OFF on orders above ₹599</h3>
              <p>Get up to 40% OFF & more offers on mobile app exclusively</p>
            </div>
          </div>
          <div className="voucher-right">
            <div className="voucher-code-pill">
              <span>Use Code:</span>
              <strong>WELCOME15</strong>
            </div>
            <button
              type="button"
              className="voucher-grab-btn"
              onClick={() => {
                navigator.clipboard.writeText("WELCOME15");
                showToast("Coupon code WELCOME15 copied!", "info");
              }}
            >
              Grab Now
            </button>
          </div>
        </div>
      </section>

      {/* 🔴 3. Circular Category Avatars (Matching Screenshot 1 & 2) */}
      <section className="storefront-section">
        <div className="category-circle-grid">
          {CATEGORY_AVATARS.map((cat) => (
            <div
              key={cat.name}
              className="category-circle-item"
              onClick={() => navigate(`/app/products?category=${encodeURIComponent(cat.cat)}`)}
            >
              <div className="category-circle-avatar">
                <img src={cat.img} alt={cat.name} />
              </div>
              <span className="category-circle-label">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 4. "Steal Drips / Hot Deals" Price-Anchored Grid (Matching Screenshot 2 middle) */}
      <section className="storefront-section">
        <div className="section-deal-header">
          <h2>💧 Steal Drips</h2>
          <span className="deal-header-sub">Handpicked budget deals updated daily</span>
        </div>

        <div className="steal-deals-grid">
          {STEAL_DRIPS_DEALS.map((deal) => (
            <div
              key={deal.name}
              className="deal-card-item"
              onClick={() => navigate(`/app/products?category=${encodeURIComponent(deal.cat)}`)}
            >
              <img src={deal.img} alt={deal.name} className="deal-card-img" />
              <div className="deal-card-overlay">
                <span className="deal-card-title">{deal.name}</span>
                <span className="deal-card-tag">{deal.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⚡ 5. "Top Trends" Lookbook Banner & Grid (Matching Screenshot 2 bottom) */}
      <section className="storefront-section">
        <div className="section-banner-header">
          <div>
            <h2>Top Trends</h2>
            <p>Fashion & luxury accessible to all</p>
          </div>
          <button
            type="button"
            className="view-all-link-btn"
            onClick={() => navigate("/app/products")}
          >
            View all <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* 💎 6. Handpicked Product Collection */}
      <section className="storefront-section">
        <div className="section-title-row">
          <h2>Featured Jewelry & Apparel</h2>
        </div>

        <div className="catalog-grid">
          {featuredProducts.map((product) => {
            const mrp = product.original_price && product.original_price > product.price ? product.original_price : product.price * 3 || 999;
            const discountPct = Math.round(((mrp - product.price) / mrp) * 100);

            return (
              <article
                key={product.id}
                className="product-card ecommerce-clean-card"
                onClick={() => navigate(`/app/products/${product.id}`)}
              >
                <div className="product-card-image">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <div className="product-card-image-placeholder">No image</div>
                  )}

                  {discountPct > 0 && (
                    <span className="discount-pill-floating">-{discountPct}%</span>
                  )}

                  <button
                    type="button"
                    className={`wishlist-btn-floating ${isWishlisted(product.id) ? "active" : ""}`}
                    onClick={(e) => handleToggleWishlist(e, product.id, product.name)}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart
                      size={18}
                      fill={isWishlisted(product.id) ? "#ae4a34" : "none"}
                      stroke={isWishlisted(product.id) ? "#ae4a34" : "currentColor"}
                    />
                  </button>
                </div>

                <div className="product-card-body">
                  <p className="product-category-tag">{product.category}</p>
                  <h3 className="product-title">{product.name}</h3>

                  <div className="rating-row">
                    <Star size={14} fill="#eab308" color="#eab308" />
                    <span>{product.rating || 4.8} (45)</span>
                  </div>

                  <div className="product-price-block">
                    <span className="selling-price">₹{product.price.toLocaleString("en-IN")}</span>
                    {mrp > product.price && (
                      <span className="mrp-price">₹{mrp.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ✨ 7. "For You" Section (Matching Screenshot 3 middle) */}
      <section className="storefront-section">
        <div className="section-title-row">
          <h2>For You</h2>
        </div>

        <div className="for-you-grid">
          {FOR_YOU_ITEMS.map((item) => (
            <div
              key={item.title}
              className="for-you-card"
              onClick={() => navigate(`/app/products?category=${encodeURIComponent(item.cat)}`)}
            >
              <img src={item.img} alt={item.title} className="for-you-img" />
              <div className="for-you-overlay">
                <span>{item.title}</span>
                <span className="arrow-btn"><ChevronRight size={16} /></span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;



