import { API_URL } from "./auth";
import type { CustomerSummary, OrderSummary, Product } from "../types/catalog";

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

export async function getAdminOverview() {
  return requestJson<{ cards: Array<{ label: string; value: string }> }>("/admin/overview");
}

export async function listProducts() {
  return requestJson<Product[]>("/products");
}

export async function saveProduct(payload: Omit<Product, "id"> & { id?: number }) {
  const body = JSON.stringify(payload);
  if (payload.id) {
    return requestJson<Product>(`/products/${payload.id}`, {
      method: "PUT",
      body,
    });
  }

  return requestJson<Product>("/products", {
    method: "POST",
    body,
  });
}

export async function removeProduct(id: number) {
  return requestJson<{ success: boolean }>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function listOrders() {
  const orders = await requestJson<Array<any>>("/admin/orders");
  return orders.map((order) => ({
    id: order.id,
    orderNo: order.order_no,
    customer: order.customer_name || `User #${order.user_id}`,
    total: order.total,
    status: order.status,
    date: new Date(order.created_at).toISOString().slice(0, 10),
  })) as OrderSummary[];
}

export async function listCustomers() {
  return requestJson<CustomerSummary[]>("/admin/customers");
}

export async function getAdminAnalytics() {
  return requestJson<Array<{ label: string; value: string }>>("/admin/analytics");
}

export async function updateOrderStatus(orderId: number, status: string): Promise<OrderSummary> {
  const order = await requestJson<any>(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  return {
    id: order.id,
    orderNo: order.order_no,
    customer: order.customer_name || `User #${order.user_id}`,
    total: order.total,
    status: order.status,
    date: new Date(order.created_at).toISOString().slice(0, 10),
  };
}

export async function listCouponsAdmin() {
  return requestJson<import("../types/catalog").Coupon[]>("/coupons/admin");
}

export async function createCouponAdmin(payload: Omit<import("../types/catalog").Coupon, "id" | "created_at">) {
  return requestJson<import("../types/catalog").Coupon>("/coupons/admin", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCouponAdmin(id: number) {
  return requestJson<{ success: boolean }>(`/coupons/admin/${id}`, {
    method: "DELETE",
  });
}
