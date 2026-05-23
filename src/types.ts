export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  stock: number;
  image: string;
  description: string;
  rating?: number;
  badge?: "Fresh" | "Best Seller" | "Low Stock" | "Organic";
  isVeg?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  slug: string;
  itemCountValue?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  discountBadge?: string;
  image: string;
  tag?: string;
  gradient?: string;
}

export interface Coupon {
  code: string;
  title: string;
  description: string;
  discount: number;
  minSpend: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "cart";
}

export interface UserSession {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: "admin" | "customer";
  smartCoins?: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address: string;
  items: {
    productName: string;
    unit: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  status: "Received" | "Packed" | "Dispatched" | "Delivered" | "Cancelled";
  paymentMethod?: "COD" | "Razorpay" | "Freecharge";
  paymentStatus?: "Pending" | "Paid" | "Success";
  date: string;
}

