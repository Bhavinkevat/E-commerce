import { Heart, Mail, Phone, MapPin, ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="storefront-footer">
      <div className="footer-top-trust">
        <div className="footer-trust-item">
          <Truck size={22} className="footer-trust-icon" />
          <div>
            <h5>Free Shipping</h5>
            <p>On all orders nationwide</p>
          </div>
        </div>
        <div className="footer-trust-item">
          <RotateCcw size={22} className="footer-trust-icon" />
          <div>
            <h5>Easy 30-Day Returns</h5>
            <p>No questions asked policy</p>
          </div>
        </div>
        <div className="footer-trust-item">
          <ShieldCheck size={22} className="footer-trust-icon" />
          <div>
            <h5>100% Certified Hallmark</h5>
            <p>Authentic gold & diamonds</p>
          </div>
        </div>
      </div>

      <div className="footer-main-grid">
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <span className="footer-brand-logo">💎</span>
            <span className="footer-brand-name">GAHENA</span>
          </div>
          <p className="footer-about">
            Gahena is your premier luxury destination for fine jewelry and fashion collections. Crafted with perfection, elegance, and timeless grace.
          </p>
          <div className="footer-contact-info">
            <p><MapPin size={16} /> 102 Luxury Mall Avenue, Mumbai, India</p>
            <p><Phone size={16} /> +91 98765 43210</p>
            <p><Mail size={16} /> support@gahena.com</p>
          </div>
        </div>

        <div className="footer-col">
          <h4>Shop Categories</h4>
          <ul>
            <li><Link to="/app/products?category=Men's Wear">Men's Wear (Shirts, T-Shirts, Pants)</Link></li>
            <li><Link to="/app/products?category=Women's Wear">Women's Wear (Tops, Kurtis, Jeans)</Link></li>
            <li><Link to="/app/products?category=Kids' Wear">Children's Wear (Shirts, Tees, Pants)</Link></li>
            <li><Link to="/app/products?category=Jewellery">Jewellery Collection (Rings, Necklaces)</Link></li>
            <li><Link to="/app/products">All Products</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/app/orders">Track My Order</Link></li>
            <li><Link to="/app/profile">My Account & Profile</Link></li>
            <li><Link to="/app/wishlist">My Wishlist</Link></li>
            <li><Link to="/app/cart">Shopping Cart</Link></li>
            <li><a href="#faq">Shipping & Returns FAQ</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Join Our Club</h4>
          <p className="newsletter-desc">Subscribe for exclusive discount offers & new collection drops.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" className="newsletter-input" />
            <button type="button" className="newsletter-btn">Subscribe</button>
          </div>
          <div className="payment-badges-row">
            <span>Secured By:</span>
            <div className="payment-pills">
              <span className="payment-pill">VISA</span>
              <span className="payment-pill">MasterCard</span>
              <span className="payment-pill">UPI / GPay</span>
              <span className="payment-pill">COD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>© 2026 GAHENA Luxury E-Commerce. All rights reserved.</p>
        <p className="made-with-love">Crafted with <Heart size={14} fill="#ae4a34" color="#ae4a34" /> for Jewelry Enthusiasts</p>
      </div>
    </footer>
  );
}

export default Footer;
