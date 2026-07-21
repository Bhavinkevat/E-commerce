export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price?: number;
  sizes?: string;
  colors?: string;
  gallery_images?: string;
  stock: number;
  rating: number;
  status: "Active" | "Draft";
  description: string;
  image_url: string;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  is_active: boolean;
  created_at: string;
}

export interface CouponApplyResult {
  valid: boolean;
  message: string;
  code: string;
  discount_amount: number;
  final_total: number;
}

export interface OrderSummary {
  id: number;
  orderNo: string;
  customer: string;
  total: number;
  status: "Pending" | "Paid" | "Shipped" | "Delivered";
  date: string;
}

export interface CustomerSummary {
  id: number;
  name: string;
  email: string;
  orders: number;
  spent: number;
  status: "Active" | "Blocked";
}

