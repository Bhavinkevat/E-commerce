export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  status: "Active" | "Draft";
  description: string;
  image_url: string;
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

