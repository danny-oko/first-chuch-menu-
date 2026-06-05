import type {
  Category,
  CreateOrderPayload,
  Dish,
  Order,
} from "./types";
import { API_ROUTES } from "./types";
import { apiUrl } from "./api-config";
import { formatApiErrorMessage, t } from "./i18n";

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
    throw new Error(formatApiErrorMessage(error.error ?? t.requestFailed, res.status));
  }

  return res.json() as Promise<T>;
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
