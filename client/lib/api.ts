import type {
  Category,
  CreateOrderPayload,
  Dish,
  Order,
} from "./types";
import { API_ROUTES } from "./types";
import { apiUrl } from "./api-config";

async function request<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...init } = options ?? {};
  const headers: HeadersInit = {
    ...(init.headers ?? {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  if (init.body && !(init.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  const res = await fetch(apiUrl(path), { ...init, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(formatApiError(error.error ?? "Request failed", res.status));
  }

  return res.json() as Promise<T>;
}

function formatApiError(message: string, status: number): string {
  if (message === "Category not found") {
    return "Category not found. Refresh the page and try again.";
  }
  if (
    message ===
    "Cannot delete category: dishes in this category have order history"
  ) {
    return "Cannot delete this category — it contains dishes that appear in past orders.";
  }
  if (message === "Cannot delete dish: it exists in past orders") {
    return "Cannot delete this dish — it appears in past orders.";
  }
  if (status >= 500) {
    return "Server error. Start the API: cd server && bun run dev";
  }
  return message;
}

export const api = {
  health: () => request<{ ok: boolean }>(API_ROUTES.health),
  getCategories: () => request<Category[]>(API_ROUTES.categories),
  getDishes: (categoryId?: string) =>
    request<Dish[]>(
      categoryId
        ? `${API_ROUTES.dishes}?categoryId=${categoryId}`
        : API_ROUTES.dishes
    ),
  getDish: (id: string) => request<Dish>(API_ROUTES.dish(id)),
  createOrder: (payload: CreateOrderPayload) =>
    request<{ order: Order; message: string }>(API_ROUTES.orders, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  adminLogin: (username: string, password: string) =>
    request<{ token: string }>(API_ROUTES.adminLogin, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  getAdminOrders: (token: string) =>
    request<Order[]>(API_ROUTES.adminOrders, { token }),
  updateOrderStatus: (token: string, id: string, status: Order["status"]) =>
    request<Order>(API_ROUTES.adminOrder(id), {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    }),
  createCategory: (token: string, name: string) =>
    request<Category>(API_ROUTES.adminCategories, {
      method: "POST",
      token,
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (token: string, id: string) =>
    request<{ success: boolean }>(API_ROUTES.adminCategory(id), {
      method: "DELETE",
      token,
    }),
  createDish: (
    token: string,
    data: {
      name: string;
      categoryId: string;
      price: number;
      imageUrl: string;
      description?: string;
    }
  ) =>
    request<Dish>(API_ROUTES.adminDishes, {
      method: "POST",
      token,
      body: JSON.stringify(data),
    }),
  deleteDish: (token: string, id: string) =>
    request<{ success: boolean }>(API_ROUTES.adminDish(id), {
      method: "DELETE",
      token,
    }),
  uploadImage: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ url: string; publicId: string }>(API_ROUTES.adminUpload, {
      method: "POST",
      token,
      body: formData,
    });
  },
};

export { apiUrl, getApiBaseUrl } from "./api-config";
