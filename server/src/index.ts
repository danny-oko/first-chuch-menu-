import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./lib/common/types";
import {
  createCategory,
  createDish,
  deleteCategory,
  deleteDish,
  adminAuth,
  adminLogin,
  getAdminOrders,
  ordersStream,
  updateOrderStatus,
  uploadImage,
} from "./controllers/admin.controller";
import {
  createOrder,
  getCategories,
  getDishById,
  getDishes,
} from "./controllers/menu.controller";

const app = new Hono<AppEnv>();

app.use(
  "/*",
  cors({
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/api/categories", getCategories);
app.get("/api/dishes", getDishes);
app.get("/api/dishes/:id", getDishById);
app.post("/api/orders", createOrder);

app.post("/api/admin/login", adminLogin);

const admin = new Hono<AppEnv>();
admin.use("/*", adminAuth);
admin.get("/orders", getAdminOrders);
admin.get("/orders/stream", ordersStream);
admin.patch("/orders/:id", updateOrderStatus);
admin.post("/categories", createCategory);
admin.delete("/categories/:id", deleteCategory);
admin.post("/dishes", createDish);
admin.delete("/dishes/:id", deleteDish);
admin.post("/upload", uploadImage);

app.route("/api/admin", admin);

app.get("/", (c) =>
  c.json({ name: "Menu API", version: "1.0.0", status: "ok" })
);

export default app;
