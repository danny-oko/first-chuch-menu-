export type Category = {
  id: string;
  name: string;
  createdAt: string;
};

export type Dish = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string;
  createdAt: string;
  categoryName: string | null;
};

export type OrderStatus = "pending" | "preparing" | "completed" | "cancelled";

export type OrderItem = {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  dishId: string;
  dishName: string | null;
  dishImageUrl?: string | null;
};

export type Order = {
  id: string;
  orderNumber: number;
  customerName: string | null;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export type CartItem = {
  dish: Dish;
  quantity: number;
};

export type CreateOrderPayload = {
  items: Array<{ dishId: string; quantity: number; price: number }>;
  totalAmount: number;
  customerName?: string;
};

export type AdminCreateOrderEntry = {
  customerName: string;
  items: Array<{ dishId: string; quantity: number }>;
};

export type AdminCreateOrderPayload = {
  orders: AdminCreateOrderEntry[];
  status?: OrderStatus;
};

/** Matches Hono Worker routes in server/src/index.ts */
export const API_ROUTES = {
  health: "/api/health",
  categories: "/api/categories",
  dishes: "/api/dishes",
  dish: (id: string) => `/api/dishes/${id}`,
  orders: "/api/orders",
  adminLogin: "/api/admin/login",
  adminOrders: "/api/admin/orders",
  adminCreateOrder: "/api/admin/orders",
  adminOrdersStream: "/api/admin/orders/stream",
  adminOrder: (id: string) => `/api/admin/orders/${id}`,
  adminCategories: "/api/admin/categories",
  adminCategory: (id: string) => `/api/admin/categories/${id}`,
  adminDishes: "/api/admin/dishes",
  adminDish: (id: string) => `/api/admin/dishes/${id}`,
  adminUpload: "/api/admin/upload",
} as const;
