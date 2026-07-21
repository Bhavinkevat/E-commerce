import { API_URL } from "./auth";
import type { OrderSummary, Product } from "../types/catalog";
import type { User } from "../types/auth";

export type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
};

const token = () => localStorage.getItem("gahena_token") || "";

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
      ...(init?.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data as T;
}

function mapCartItem(item: any): CartItem {
  return {
    id: item.id,
    productId: item.product_id,
    quantity: item.quantity,
    product: item.product
      ? {
          id: item.product.id,
          name: item.product.name,
          category: item.product.category,
          price: item.product.price,
          original_price: item.product.original_price || 0,
          sizes: item.product.sizes || "",
          colors: item.product.colors || "",
          gallery_images: item.product.gallery_images || "",
          stock: item.product.stock,
          rating: item.product.rating,
          status: item.product.status,
          description: item.product.description,
          image_url: item.product.image_url || "",
        }
      : undefined,
  };
}

function mapOrder(order: any): OrderSummary {
  return {
    id: order.id,
    orderNo: order.order_no,
    customer: order.customer_name || "You",
    total: order.total,
    status: order.status,
    date: new Date(order.created_at).toISOString().slice(0, 10),
  };
}

export async function getHomeSummary() {
  const [products, cart, wishlist, orders] = await Promise.all([
    listProducts(),
    getCart(),
    getWishlist(),
    getOrderHistory(),
  ]);

  return {
    cards: [
      { label: "Orders", value: String(orders.length) },
      { label: "Cart Items", value: String(cart.length) },
      { label: "Wishlist", value: String(wishlist.length) },
      { label: "Available Products", value: String(products.length) },
    ],
  };
}

export async function listProducts() {
  return requestJson<Product[]>("/products");
}

export async function getProductDetails(productId: number) {
  return requestJson<Product | null>(`/products/${productId}`);
}

export async function getCart(): Promise<CartItem[]> {
  const items = await requestJson<any[]>("/cart");
  return items.map(mapCartItem);
}

export async function addToCart(productId: number) {
  const items = await requestJson<any[]>("/cart", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity: 1 }),
  });
  return items.map(mapCartItem);
}

export async function removeFromCart(productId: number) {
  const items = await requestJson<any[]>(`/cart/${productId}`, {
    method: "DELETE",
  });
  return items.map(mapCartItem);
}

export async function getWishlist(): Promise<Product[]> {
  const items = await requestJson<any[]>("/wishlist");
  return items
    .map((item) => item.product)
    .filter(Boolean)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      rating: product.rating,
      status: product.status,
      description: product.description,
      image_url: product.image_url || "",
    }));
}

export async function toggleWishlist(productId: number) {
  const items = await requestJson<any[]>("/wishlist/toggle", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
  return items
    .map((item) => item.product)
    .filter(Boolean)
    .map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      rating: product.rating,
      status: product.status,
      description: product.description,
      image_url: product.image_url || "",
    }));
}

export async function getOrderHistory() {
  const orders = await requestJson<any[]>("/orders");
  return orders.map(mapOrder);
}

export async function updateProfile(payload: {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
}): Promise<User> {
  return requestJson<User>("/auth/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function checkout(shippingAddress: string, productId?: number): Promise<OrderSummary> {
  const payload = {
    shipping_address: shippingAddress,
    product_id: productId,
  };
  const order = await requestJson<any>("/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return mapOrder(order);
}

export async function listActiveCoupons() {
  return requestJson<import("../types/catalog").Coupon[]>("/coupons/active");
}

export async function applyCoupon(code: string, cartTotal: number) {
  return requestJson<import("../types/catalog").CouponApplyResult>("/coupons/apply", {
    method: "POST",
    body: JSON.stringify({ code, cart_total: cartTotal }),
  });
}
