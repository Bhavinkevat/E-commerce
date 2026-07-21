import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  getCart, 
  removeFromCart, 
  updateProfile, 
  checkout, 
  applyCoupon,
  type CartItem
} from "../../apis/user";
import type { CouponApplyResult, OrderSummary } from "../../types/catalog";
import { 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  X,
  ShoppingBag,
  Coins,
  Tag
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

function CartPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();

  // Checkout & Coupon states
  const [checkoutItem, setCheckoutItem] = useState<CartItem | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<number>(1);
  const [address, setAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [couponCodeInput, setCouponCodeInput] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<CouponApplyResult | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string>("");
  const [successOrder, setSuccessOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    void getCart().then(setItems);
  }, []);

  const handleBuyClick = (item: CartItem) => {
    setCheckoutItem(item);
    setCheckoutStep(1);
    setAddress(user?.address || "");
    setPaymentMethod("COD");
    setCouponCodeInput("");
    setAppliedDiscount(null);
    setOrderError("");
    setSuccessOrder(null);
  };

  const handleApplyCouponCode = async () => {
    if (!checkoutItem || !couponCodeInput.trim()) return;
    setApplyingCoupon(true);
    setOrderError("");
    try {
      const subtotal = (checkoutItem.product?.price || 0) * checkoutItem.quantity;
      const res = await applyCoupon(couponCodeInput.trim(), subtotal);
      if (res.valid) {
        setAppliedDiscount(res);
        showToast(res.message, "success");
      } else {
        setAppliedDiscount(null);
        showToast(res.message, "error");
      }
    } catch {
      showToast("Could not apply coupon.", "error");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutItem(null);
    setCheckoutStep(1);
  };

  const handleSaveAddressAndContinue = async () => {
    if (!address.trim()) {
      setOrderError("Please enter a valid shipping address.");
      return;
    }
    setOrderError("");
    try {
      const updatedUser = await updateProfile({ address });
      updateUser(updatedUser);
      showToast("Shipping address updated!", "success");
      setCheckoutStep(3);
    } catch (err) {
      setOrderError("Failed to update shipping address. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    if (!checkoutItem) return;
    setIsPlacingOrder(true);
    setOrderError("");
    try {
      const order = await checkout(address, checkoutItem.productId);
      setSuccessOrder(order);
      showToast("Order placed successfully!", "success");
      // Refresh cart items
      const updatedCart = await getCart();
      setItems(updatedCart);
      setCheckoutStep(5);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section className="panel-stack">
      <header className="panel-header">
        <div>
          <p className="eyebrow">User</p>
          <h1>Cart</h1>
        </div>
      </header>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Action</th>
              <th>Price</th>
              <th>Buy</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  Your cart is empty.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.productId}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="table-thumb">
                        {item.product?.image_url ? (
                          <img src={item.product.image_url} alt={item.product.name} />
                        ) : (
                          <span className="table-thumb-placeholder">No image</span>
                        )}
                      </div>
                      <span>{item.product?.name}</span>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>
                    <button
                      className="mini-button danger"
                      type="button"
                      onClick={async () => {
                        const updatedCart = await removeFromCart(item.productId);
                        setItems(updatedCart);
                        showToast(`${item.product?.name || "Product"} removed from cart.`, "info");
                      }}
                    >
                      Remove
                    </button>
                  </td>
                  <td>₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}</td>
                  <td>
                    <button
                      className="mini-button success"
                      type="button"
                      onClick={() => handleBuyClick(item)}
                    >
                      Buy
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Step-by-Step Checkout Modal */}
      {checkoutItem && (
        <div className="modal-overlay" onClick={closeCheckout}>
          <div
            className="modal-container"
            role="dialog"
            aria-modal="true"
            style={{ width: "min(560px, 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="modal-header">
              <h2 className="modal-title">
                {checkoutStep === 5 ? "Order Confirmed!" : "Checkout"}
              </h2>
              <button
                type="button"
                className="mini-button"
                onClick={closeCheckout}
                aria-label="Close modal"
                style={{ border: "0", background: "transparent", fontSize: "1.4rem", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </header>

            <div className="modal-body">
              {/* Stepper Indicators for Steps 1 to 4 */}
              {checkoutStep < 5 && (
                <div className="checkout-stepper">
                  <div 
                    className="checkout-stepper-progress" 
                    style={{ width: `${((checkoutStep - 1) / 3) * 100}%` }}
                  />
                  <div className={`stepper-step ${checkoutStep >= 1 ? "active" : ""} ${checkoutStep > 1 ? "completed" : ""}`}>
                    <div className="step-bubble">1</div>
                    <span className="step-label">Product</span>
                  </div>
                  <div className={`stepper-step ${checkoutStep >= 2 ? "active" : ""} ${checkoutStep > 2 ? "completed" : ""}`}>
                    <div className="step-bubble">2</div>
                    <span className="step-label">Delivery</span>
                  </div>
                  <div className={`stepper-step ${checkoutStep >= 3 ? "active" : ""} ${checkoutStep > 3 ? "completed" : ""}`}>
                    <div className="step-bubble">3</div>
                    <span className="step-label">Payment</span>
                  </div>
                  <div className={`stepper-step ${checkoutStep >= 4 ? "active" : ""}`}>
                    <div className="step-bubble">4</div>
                    <span className="step-label">Review</span>
                  </div>
                </div>
              )}

              {/* STEP 1: Product & Quantity details */}
              {checkoutStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Confirm Item details</h3>
                  <div style={{ display: "flex", gap: "16px", background: "#f8faf7", padding: "16px", borderRadius: "8px", border: "1px solid #e6ece5" }}>
                    <div className="table-thumb" style={{ width: "80px", height: "80px", flexShrink: 0 }}>
                      {checkoutItem.product?.image_url ? (
                        <img src={checkoutItem.product.image_url} alt={checkoutItem.product.name} />
                      ) : (
                        <span className="table-thumb-placeholder">No image</span>
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem" }}>{checkoutItem.product?.name}</h4>
                      <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#516057" }}>
                        Category: {checkoutItem.product?.category || "General"}
                      </p>
                      <div style={{ display: "flex", gap: "20px", fontSize: "0.9rem" }}>
                        <span><strong>Qty:</strong> {checkoutItem.quantity}</span>
                        <span><strong>Price:</strong> ₹{checkoutItem.product?.price?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="coupon-apply-section">
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        className="text-field-input"
                        placeholder="Have a coupon? e.g. WELCOME25"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        style={{ flex: 1, textTransform: "uppercase" }}
                      />
                      <button
                        type="button"
                        className="mini-button"
                        onClick={handleApplyCouponCode}
                        disabled={applyingCoupon || !couponCodeInput.trim()}
                        style={{ background: "#1f6f59", color: "#fff", padding: "0 16px" }}
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </button>
                    </div>
                    {appliedDiscount?.valid && (
                      <p style={{ color: "#1f6f59", fontSize: "0.85rem", margin: "6px 0 0", fontWeight: 600 }}>
                        ✓ Coupon {appliedDiscount.code} applied! Saved ₹{appliedDiscount.discount_amount}
                      </p>
                    )}
                  </div>

                  <div className="checkout-details-card">
                    <div className="checkout-detail-row">
                      <span>Subtotal</span>
                      <span>₹{((checkoutItem.product?.price || 0) * checkoutItem.quantity).toLocaleString("en-IN")}</span>
                    </div>
                    {appliedDiscount?.valid && (
                      <div className="checkout-detail-row" style={{ color: "#1f6f59" }}>
                        <span>Coupon Discount ({appliedDiscount.code})</span>
                        <span>- ₹{appliedDiscount.discount_amount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="checkout-detail-row">
                      <span>Shipping</span>
                      <span style={{ color: "#1f6f59", fontWeight: 700 }}>FREE</span>
                    </div>
                    <div className="checkout-detail-row" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                      <span>Total Amount</span>
                      <span>
                        ₹
                        {appliedDiscount?.valid
                          ? appliedDiscount.final_total.toLocaleString("en-IN")
                          : ((checkoutItem.product?.price || 0) * checkoutItem.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Delivery Address */}
              {checkoutStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Shipping Address</h3>
                  
                  {!user?.address && (
                    <div className="feedback error" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px" }}>
                      <MapPin size={18} style={{ flexShrink: 0 }} />
                      <span>No address found. Please enter a delivery address to proceed.</span>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label htmlFor="checkout-address" className="field-label">Delivery Destination</label>
                    <textarea
                      id="checkout-address"
                      rows={4}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your full street address, city, state, postal code, and country..."
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid #cfd8d0",
                        outline: "none",
                        fontFamily: "inherit",
                        resize: "vertical",
                        fontSize: "0.95rem",
                        lineHeight: "1.5"
                      }}
                    />
                  </div>

                  {orderError && (
                    <div className="feedback error" style={{ fontSize: "0.88rem" }}>
                      {orderError}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Payment Method */}
              {checkoutStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Choose Payment Method</h3>
                  
                  <div className="payment-methods-grid">
                    <div 
                      className={`payment-method-card ${paymentMethod === "COD" ? "selected" : ""}`}
                      onClick={() => setPaymentMethod("COD")}
                    >
                      <div className="payment-method-icon">
                        <Coins size={20} />
                      </div>
                      <div className="payment-method-info">
                        <span className="payment-method-title">Cash on Delivery (COD)</span>
                        <span className="payment-method-desc">Pay with cash when your product arrives</span>
                      </div>
                    </div>

                    <div 
                      className={`payment-method-card ${paymentMethod === "Card" ? "selected" : ""}`}
                      onClick={() => setPaymentMethod("Card")}
                    >
                      <div className="payment-method-icon">
                        <CreditCard size={20} />
                      </div>
                      <div className="payment-method-info">
                        <span className="payment-method-title">Credit / Debit Card</span>
                        <span className="payment-method-desc">Pay securely using Visa, Mastercard, or RuPay</span>
                      </div>
                    </div>

                    <div 
                      className={`payment-method-card ${paymentMethod === "UPI" ? "selected" : ""}`}
                      onClick={() => setPaymentMethod("UPI")}
                    >
                      <div className="payment-method-icon">
                        <Sparkles size={20} />
                      </div>
                      <div className="payment-method-info">
                        <span className="payment-method-title">UPI Apps (GPay, PhonePe, UPI ID)</span>
                        <span className="payment-method-desc">Instantly pay using any BHIM UPI application</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Review Summary & Place Order */}
              {checkoutStep === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Review Order</h3>

                  <div style={{ display: "grid", gap: "12px" }}>
                    {/* Item Row */}
                    <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #edf2ec", paddingBottom: "12px" }}>
                      <div className="table-thumb" style={{ width: "50px", height: "50px", flexShrink: 0 }}>
                        {checkoutItem.product?.image_url ? (
                          <img src={checkoutItem.product.image_url} alt={checkoutItem.product.name} />
                        ) : (
                          <span className="table-thumb-placeholder">No image</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", display: "block" }}>
                          {checkoutItem.product?.name}
                        </span>
                        <span style={{ fontSize: "0.85rem", color: "#516057" }}>
                          Qty: {checkoutItem.quantity} &times; ₹{checkoutItem.product?.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Shipping Address Row */}
                    <div>
                      <span style={{ display: "block", fontSize: "0.8rem", color: "#7a877f", textTransform: "uppercase", fontWeight: 700 }}>
                        Shipping Destination
                      </span>
                      <span style={{ fontSize: "0.9rem", lineHeight: "1.4", display: "block", marginTop: "4px" }}>
                        {address}
                      </span>
                    </div>

                    {/* Payment Mode Row */}
                    <div>
                      <span style={{ display: "block", fontSize: "0.8rem", color: "#7a877f", textTransform: "uppercase", fontWeight: 700 }}>
                        Payment Method
                      </span>
                      <span style={{ fontSize: "0.9rem", display: "block", marginTop: "4px" }}>
                        {paymentMethod === "COD" && "Cash on Delivery (COD)"}
                        {paymentMethod === "Card" && "Credit / Debit Card (Online)"}
                        {paymentMethod === "UPI" && "BHIM UPI Payment (Online)"}
                      </span>
                    </div>

                    {/* Totals */}
                    <div className="checkout-details-card">
                      <div className="checkout-detail-row">
                        <span>Total Price</span>
                        <strong>₹{((checkoutItem.product?.price || 0) * checkoutItem.quantity).toLocaleString("en-IN")}</strong>
                      </div>
                    </div>
                  </div>

                  {orderError && (
                    <div className="feedback error" style={{ fontSize: "0.88rem" }}>
                      {orderError}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Success Confirmation Screen */}
              {checkoutStep === 5 && successOrder && (
                <div className="checkout-success-view">
                  <div className="success-circle">
                    <CheckCircle size={40} />
                  </div>
                  <h3 style={{ fontSize: "1.4rem", margin: "0 0 8px" }}>Thank You!</h3>
                  <p style={{ color: "#516057", margin: "0 0 20px", fontSize: "0.95rem" }}>
                    Your order has been placed successfully and is being processed.
                  </p>

                  <div style={{ background: "#f4f6f2", padding: "16px", borderRadius: "8px", border: "1px solid #edf2ec", width: "100%", textAlign: "left", marginBottom: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                      <span style={{ color: "#7a877f" }}>Order Reference:</span>
                      <strong style={{ color: "#18211d" }}>{successOrder.orderNo}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem" }}>
                      <span style={{ color: "#7a877f" }}>Total Amount:</span>
                      <strong style={{ color: "#18211d" }}>₹{successOrder.total.toLocaleString("en-IN")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                      <span style={{ color: "#7a877f" }}>Payment Method:</span>
                      <strong style={{ color: "#1f6f59" }}>{paymentMethod}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="modal-footer" style={{ borderTop: "1px solid #e6ece5" }}>
              {checkoutStep === 1 && (
                <>
                  <button
                    type="button"
                    className="mini-button"
                    onClick={closeCheckout}
                    style={{ minWidth: "90px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="mini-button success"
                    onClick={() => setCheckoutStep(2)}
                    style={{ minWidth: "95px", background: "#1f6f59", color: "#ffffff", borderColor: "#1f6f59" }}
                  >
                    Continue <ArrowRight size={16} style={{ marginLeft: "4px" }} />
                  </button>
                </>
              )}

              {checkoutStep === 2 && (
                <>
                  <button
                    type="button"
                    className="mini-button"
                    onClick={() => setCheckoutStep(1)}
                    style={{ marginRight: "auto" }}
                  >
                    <ArrowLeft size={16} style={{ marginRight: "4px" }} /> Back
                  </button>
                  <button
                    type="button"
                    className="mini-button success"
                    onClick={handleSaveAddressAndContinue}
                    style={{ minWidth: "95px", background: "#1f6f59", color: "#ffffff", borderColor: "#1f6f59" }}
                  >
                    Continue <ArrowRight size={16} style={{ marginLeft: "4px" }} />
                  </button>
                </>
              )}

              {checkoutStep === 3 && (
                <>
                  <button
                    type="button"
                    className="mini-button"
                    onClick={() => setCheckoutStep(2)}
                    style={{ marginRight: "auto" }}
                  >
                    <ArrowLeft size={16} style={{ marginRight: "4px" }} /> Back
                  </button>
                  <button
                    type="button"
                    className="mini-button success"
                    onClick={() => setCheckoutStep(4)}
                    style={{ minWidth: "95px", background: "#1f6f59", color: "#ffffff", borderColor: "#1f6f59" }}
                  >
                    Continue <ArrowRight size={16} style={{ marginLeft: "4px" }} />
                  </button>
                </>
              )}

              {checkoutStep === 4 && (
                <>
                  <button
                    type="button"
                    className="mini-button"
                    onClick={() => setCheckoutStep(3)}
                    disabled={isPlacingOrder}
                    style={{ marginRight: "auto" }}
                  >
                    <ArrowLeft size={16} style={{ marginRight: "4px" }} /> Back
                  </button>
                  <button
                    type="button"
                    className="mini-button success"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    style={{ minWidth: "120px", background: "#1f6f59", color: "#ffffff", borderColor: "#1f6f59" }}
                  >
                    {isPlacingOrder ? "Placing Order..." : "Place Order"}
                  </button>
                </>
              )}

              {checkoutStep === 5 && (
                <>
                  <button
                    type="button"
                    className="mini-button"
                    onClick={() => {
                      closeCheckout();
                      navigate("/app/orders");
                    }}
                    style={{ marginRight: "auto" }}
                  >
                    <ShoppingBag size={16} style={{ marginRight: "4px" }} /> Order History
                  </button>
                  <button
                    type="button"
                    className="mini-button success"
                    onClick={closeCheckout}
                    style={{ minWidth: "130px", background: "#1f6f59", color: "#ffffff", borderColor: "#1f6f59" }}
                  >
                    Continue Shopping
                  </button>
                </>
              )}
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartPage;
