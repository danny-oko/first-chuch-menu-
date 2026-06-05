// Shared API contract — keep in sync with client/lib/types.ts and server/src/index.ts
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
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
};

export const API_ROUTES = {
  health: "/api/health",
  categories: "/api/categories",
  dishes: "/api/dishes",
  orders: "/api/orders",
  adminLogin: "/api/admin/login",
  adminOrders: "/api/admin/orders",
  adminCategories: "/api/admin/categories",
  adminDishes: "/api/admin/dishes",
  adminUpload: "/api/admin/upload",
} as const;
