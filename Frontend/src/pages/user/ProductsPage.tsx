import { useEffect, useMemo, useState } from "react";
import { Heart, Search, X } from "lucide-react";
import { listProducts, toggleWishlist, getWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const CATEGORIES = [
  "All",
  "Men's Clothes",
  "Women's Clothes",
  "Men's Footwear",
  "Women's Footwear",
  "Jewellery",
];

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    void listProducts().then(setProducts);
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

  const calculateDiscountPercent = (sellingPrice: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= sellingPrice) return null;
    const pct = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
    return pct > 0 ? `${pct}% off` : null;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (selectedCategory === "All") return true;

      const pCat = product.category.toLowerCase();
      const selCat = selectedCategory.toLowerCase();

      if (pCat === selCat) return true;

      if (selCat === "men's clothes") {
        return (pCat.includes("men") && (pCat.includes("cloth") || pCat.includes("shirt") || pCat.includes("pant") || pCat.includes("wear"))) || pCat.includes("men's clothes");
      }
      if (selCat === "women's clothes") {
        return (pCat.includes("women") && (pCat.includes("cloth") || pCat.includes("dress") || pCat.includes("top") || pCat.includes("wear"))) || pCat.includes("women's clothes");
      }
      if (selCat === "men's footwear") {
        return pCat.includes("men") && (pCat.includes("footwear") || pCat.includes("shoe") || pCat.includes("sneaker"));
      }
      if (selCat === "women's footwear") {
        return pCat.includes("women") && (pCat.includes("footwear") || pCat.includes("shoe") || pCat.includes("heel"));
      }
      if (selCat === "jewellery") {
        return pCat.includes("jewel") || pCat.includes("earring") || pCat.includes("ring") || pCat.includes("necklace");
      }

      return pCat.includes(selCat) || (pCat.includes("footwear") && selCat.includes("footwear"));
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <section className="panel-stack">
      <header className="panel-header catalog-header">
        <div>
          <p className="eyebrow">Explore Catalog</p>
          <h1>Products</h1>
        </div>

        <div className="product-search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="product-search-input"
            placeholder="Search for products, brands & more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="category-pills-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="info-card empty-catalog-state">
          <span>No products found matching your search or selected category.</span>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredProducts.map((product) => {
            const mrp = product.original_price && product.original_price > product.price ? product.original_price : product.price * 3 || 999;
            const discountBadge = calculateDiscountPercent(product.price, mrp);

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
                  
                  <div className="product-price-block">
                    <span className="selling-price">₹{product.price.toLocaleString("en-IN")}</span>
                    {mrp > product.price && (
                      <span className="mrp-price">₹{mrp.toLocaleString("en-IN")}</span>
                    )}
                    {discountBadge && (
                      <span className="discount-badge">{discountBadge}</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProductsPage;

