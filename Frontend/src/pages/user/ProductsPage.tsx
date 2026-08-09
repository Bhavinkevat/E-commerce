import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Star, X } from "lucide-react";
import { listProducts, toggleWishlist, getWishlist } from "../../apis/user";
import type { Product } from "../../types/catalog";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const CATEGORIES = [
  "All",
  "Men's Shirts",
  "Men's T-Shirts",
  "Men's Pants",
  "Men's Trackpants",
  "Women's Tops",
  "Women's Kurtis",
  "Women's Jeans",
  "Jewellery",
  "Kids' Wear",
  "Men's Footwear",
  "Women's Footwear",
  "Kids' Footwear",
];

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    setSearchQuery(searchParams.get("search") || "");
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

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
      const pName = product.name.toLowerCase();
      const pCat = product.category.toLowerCase();
      const pDesc = (product.description || "").toLowerCase();

      const matchesSearch =
        !query ||
        pName.includes(query) ||
        pCat.includes(query) ||
        pDesc.includes(query);

      if (!matchesSearch) return false;

      if (selectedCategory === "All") return true;

      const selCat = selectedCategory.toLowerCase();

      // Direct exact match first
      if (pCat === selCat) return true;

      // Header Department matching: "Men's Wear" / "Men's Clothes"
      if (selCat === "men's wear" || selCat === "men's clothes") {
        return (
          pCat.includes("men") ||
          pName.includes("men") ||
          pCat === "men's wear" ||
          pCat === "men's clothes" ||
          pCat === "men's shirts" ||
          pCat === "men's t-shirts" ||
          pCat === "men's pants" ||
          pCat === "men's trackpants" ||
          pCat === "men's footwear"
        );
      }

      // Header Department matching: "Women's Wear" / "Women's Clothes"
      if (selCat === "women's wear" || selCat === "women's clothes") {
        return (
          pCat.includes("women") ||
          pName.includes("women") ||
          pCat === "women's wear" ||
          pCat === "women's clothes" ||
          pCat === "women's tops" ||
          pCat === "women's kurtis" ||
          pCat === "women's jeans" ||
          pCat === "women's footwear"
        );
      }

      // Department subcategory smart matching
      if (selCat === "men's footwear") {
        return (
          pCat === "men's footwear" ||
          (pCat.includes("footwear") && (pCat.includes("men") || pName.includes("men"))) ||
          ((pCat.includes("shoe") || pCat.includes("sneaker")) && (pCat.includes("men") || pName.includes("men")))
        );
      }
      if (selCat === "women's footwear") {
        return (
          pCat === "women's footwear" ||
          (pCat.includes("footwear") && (pCat.includes("women") || pName.includes("women"))) ||
          ((pCat.includes("shoe") || pCat.includes("heel") || pCat.includes("sandal")) && (pCat.includes("women") || pName.includes("women")))
        );
      }
      if (selCat === "kids' footwear") {
        return (
          pCat === "kids' footwear" ||
          (pCat.includes("footwear") && (pCat.includes("kid") || pName.includes("kid"))) ||
          ((pCat.includes("shoe") || pCat.includes("sandal")) && (pCat.includes("kid") || pName.includes("kid")))
        );
      }
      if (selCat === "men's shirts") {
        return (
          pCat === "men's shirts" ||
          (pCat.includes("shirt") && !pCat.includes("t-shirt") && (pCat.includes("men") || pName.includes("men"))) ||
          (pName.includes("shirt") && !pName.includes("t-shirt") && (pName.includes("men") || pCat.includes("men")))
        );
      }
      if (selCat === "men's t-shirts") {
        return (
          pCat === "men's t-shirts" ||
          pCat.includes("t-shirt") ||
          ((pName.includes("t-shirt") || pName.includes("tee")) && (pName.includes("men") || pCat.includes("men")))
        );
      }
      if (selCat === "men's pants") {
        return (
          pCat === "men's pants" ||
          (pCat.includes("pant") && !pCat.includes("track")) ||
          ((pName.includes("pant") || pName.includes("trouser")) && !pName.includes("track"))
        );
      }
      if (selCat === "men's trackpants") {
        return (
          pCat === "men's trackpants" ||
          pCat.includes("track") ||
          pName.includes("track") ||
          pName.includes("jogger")
        );
      }
      if (selCat === "women's tops") {
        return pCat === "women's tops" || pCat.includes("top") || pName.includes("top") || pName.includes("blouse");
      }
      if (selCat === "women's kurtis") {
        return pCat === "women's kurtis" || pCat.includes("kurti") || pName.includes("kurti") || pName.includes("kurta");
      }
      if (selCat === "women's jeans") {
        return pCat === "women's jeans" || pCat.includes("jean") || pName.includes("jean") || pName.includes("denim");
      }
      if (selCat === "kids' wear" || selCat.includes("kids")) {
        return pCat === "kids' wear" || pCat.includes("kid") || pName.includes("kid") || pName.includes("child");
      }
      if (selCat.includes("jewel")) {
        return pCat.includes("jewel") || pName.includes("ring") || pName.includes("necklace") || pName.includes("earring");
      }

      return pCat.includes(selCat);
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

                  {discountBadge && (
                    <span className="discount-pill-floating">-{discountBadge}</span>
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
                    <span>{product.rating || 4.8} (32 reviews)</span>
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
      )}
    </section>
  );
}

export default ProductsPage;

