import { desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { jsonError } from "../lib/api-response";
import {
  adminAuth,
  createId,
  signAdminToken,
  validateAdminCredentials,
} from "../lib/auth";
import type { AppEnv } from "../lib/common/types";
import {
  insertOrder,
  OrderValidationError,
} from "../lib/create-order";
import {
  formatDishResponse,
  normalizeImageUrls,
  serializeImageUrls,
} from "../lib/dish-images";
import { useDB } from "../lib/db/db";
import {
  categories,
  dishes,
  orderItems,
  orders,
  type OrderStatus,
} from "../schema/menu.schema";

export async function adminLogin(c: Context<AppEnv>) {
  const body = await c.req.json<{ username: string; password: string }>();

  if (!validateAdminCredentials(body.username, body.password)) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await signAdminToken(c.env.JWT_SECRET);
  return c.json({ token });
}

export async function createCategory(c: Context<AppEnv>) {
  const db = useDB(c);
  const body = await c.req.json<{ name: string }>();

  if (!body.name?.trim()) {
    return c.json({ error: "Category name is required" }, 400);
  }

  const [category] = await db
    .insert(categories)
    .values({ id: createId(), name: body.name.trim() })
    .returning();

  return c.json(category, 201);
}

export async function deleteCategory(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");

  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!category) {
    return jsonError(c, "Category not found", 404);
  }

  const categoryDishes = await db
    .select({ id: dishes.id })
    .from(dishes)
    .where(eq(dishes.categoryId, id));

  if (categoryDishes.length) {
    await db.delete(dishes).where(eq(dishes.categoryId, id));
  }

  await db.delete(categories).where(eq(categories.id, id));
  return c.json({ success: true });
}

export async function createDish(c: Context<AppEnv>) {
  const db = useDB(c);
  const body = await c.req.json<{
    name: string;
    categoryId: string;
    price: number;
    imageUrl?: string;
    imageUrls?: string[];
    description?: string;
  }>();

  const urls = normalizeImageUrls(body.imageUrls, body.imageUrl);

  if (!body.name || !body.categoryId || !urls.length || body.price <= 0) {
    return c.json({ error: "Invalid dish payload" }, 400);
  }

  const [dish] = await db
    .insert(dishes)
    .values({
      id: createId(),
      name: body.name,
      categoryId: body.categoryId,
      price: body.price,
      imageUrl: urls[0],
      imageUrls: serializeImageUrls(urls),
      description: body.description ?? null,
    })
    .returning();

  const [withCategory] = await db
    .select({
      id: dishes.id,
      categoryId: dishes.categoryId,
      name: dishes.name,
      description: dishes.description,
      price: dishes.price,
      imageUrl: dishes.imageUrl,
      imageUrls: dishes.imageUrls,
      createdAt: dishes.createdAt,
      categoryName: categories.name,
    })
    .from(dishes)
    .leftJoin(categories, eq(dishes.categoryId, categories.id))
    .where(eq(dishes.id, dish.id))
    .limit(1);

  return c.json(formatDishResponse(withCategory ?? dish), 201);
}

export async function updateDish(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");
  const body = await c.req.json<{
    name?: string;
    categoryId?: string;
    price?: number;
    imageUrl?: string;
    imageUrls?: string[];
    description?: string | null;
  }>();

  const [existing] = await db
    .select()
    .from(dishes)
    .where(eq(dishes.id, id))
    .limit(1);

  if (!existing) {
    return jsonError(c, "Dish not found", 404);
  }

  const updates: {
    name?: string;
    categoryId?: string;
    price?: number;
    imageUrl?: string;
    imageUrls?: string;
    description?: string | null;
  } = {};

  if (body.name !== undefined) {
    if (!body.name.trim()) {
      return jsonError(c, "Invalid dish payload", 400);
    }
    updates.name = body.name.trim();
  }

  if (body.categoryId !== undefined) {
    if (!body.categoryId) {
      return jsonError(c, "Invalid dish payload", 400);
    }
    updates.categoryId = body.categoryId;
  }

  if (body.price !== undefined) {
    if (body.price <= 0) {
      return jsonError(c, "Invalid dish payload", 400);
    }
    updates.price = body.price;
  }

  if (body.imageUrls !== undefined || body.imageUrl !== undefined) {
    const urls = normalizeImageUrls(body.imageUrls, body.imageUrl);
    if (!urls.length) {
      return jsonError(c, "Invalid dish payload", 400);
    }
    updates.imageUrl = urls[0];
    updates.imageUrls = serializeImageUrls(urls);
  }

  if (body.description !== undefined) {
    updates.description = body.description?.trim() || null;
  }

  if (!Object.keys(updates).length) {
    return jsonError(c, "No updates provided", 400);
  }

  await db.update(dishes).set(updates).where(eq(dishes.id, id));

  const [withCategory] = await db
    .select({
      id: dishes.id,
      categoryId: dishes.categoryId,
      name: dishes.name,
      description: dishes.description,
      price: dishes.price,
      imageUrl: dishes.imageUrl,
      imageUrls: dishes.imageUrls,
      createdAt: dishes.createdAt,
      categoryName: categories.name,
    })
    .from(dishes)
    .leftJoin(categories, eq(dishes.categoryId, categories.id))
    .where(eq(dishes.id, id))
    .limit(1);

  return c.json(formatDishResponse(withCategory ?? existing));
}

export async function deleteDish(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");

  const [dish] = await db
    .select()
    .from(dishes)
    .where(eq(dishes.id, id))
    .limit(1);

  if (!dish) {
    return jsonError(c, "Dish not found", 404);
  }

  await db.delete(dishes).where(eq(dishes.id, id));
  return c.json({ success: true });
}

export async function uploadImage(c: Context<AppEnv>) {
  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  const cloudinaryForm = new FormData();
  cloudinaryForm.append("file", file);
  cloudinaryForm.append("upload_preset", c.env.CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${c.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: cloudinaryForm },
  );

  if (!response.ok) {
    const error = await response.text();
    return c.json({ error: "Upload failed", details: error }, 500);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };
  return c.json({ url: data.secure_url, publicId: data.public_id });
}

export async function createAdminOrder(c: Context<AppEnv>) {
  const db = useDB(c);
  const body = await c.req.json<{
    customerName?: string;
    items?: Array<{ dishId: string; quantity: number }>;
    orders?: Array<{
      customerName: string;
      items: Array<{ dishId: string; quantity: number }>;
    }>;
    status?: OrderStatus;
  }>();

  const status = body.status ?? "pending";
  const validStatuses: OrderStatus[] = [
    "pending",
    "preparing",
    "completed",
    "cancelled",
  ];

  if (!validStatuses.includes(status)) {
    return jsonError(c, "Invalid status", 400);
  }

  const payloads =
    body.orders ??
    (body.items
      ? [{ customerName: body.customerName ?? "", items: body.items }]
      : []);

  if (!payloads.length) {
    return jsonError(c, "Invalid order payload", 400);
  }

  try {
    const created = [];
    for (const entry of payloads) {
      if (!entry.customerName?.trim()) {
        throw new OrderValidationError("Customer name is required");
      }
      const order = await insertOrder(db, entry.items ?? [], {
        status,
        customerName: entry.customerName.trim(),
      });
      created.push(order);
    }

    return c.json(created.length === 1 ? created[0] : { orders: created }, 201);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return jsonError(c, err.message, err.status);
    }
    throw err;
  }
}

export async function getAdminOrders(c: Context<AppEnv>) {
  const db = useDB(c);
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  const ordersWithItems = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          priceAtPurchase: orderItems.priceAtPurchase,
          dishId: orderItems.dishId,
          dishName: orderItems.dishName,
          dishImageUrl: dishes.imageUrl,
        })
        .from(orderItems)
        .leftJoin(dishes, eq(orderItems.dishId, dishes.id))
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    }),
  );

  return c.json(ordersWithItems);
}

export async function updateOrderStatus(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");
  const body = await c.req.json<{ status: OrderStatus }>();

  const validStatuses: OrderStatus[] = [
    "pending",
    "preparing",
    "completed",
    "cancelled",
  ];

  if (!validStatuses.includes(body.status)) {
    return c.json({ error: "Invalid status" }, 400);
  }

  const [updated] = await db
    .update(orders)
    .set({ status: body.status })
    .where(eq(orders.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Order not found" }, 404);
  }

  return c.json(updated);
}

export async function deleteOrder(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    return jsonError(c, "Order not found", 404);
  }

  await db.delete(orders).where(eq(orders.id, id));
  return c.json({ success: true });
}

export async function ordersStream(c: Context<AppEnv>) {
  const db = useDB(c);

  return c.newResponse(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let lastSnapshot = "";

        const send = (data: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        };

        send({ type: "connected" });

        const poll = async () => {
          try {
            const allOrders = await db
              .select()
              .from(orders)
              .orderBy(desc(orders.createdAt));

            const ordersWithItems = await Promise.all(
              allOrders.map(async (order) => {
                const items = await db
                  .select({
                    id: orderItems.id,
                    quantity: orderItems.quantity,
                    priceAtPurchase: orderItems.priceAtPurchase,
                    dishId: orderItems.dishId,
                    dishName: orderItems.dishName,
                  })
                  .from(orderItems)
                  .leftJoin(dishes, eq(orderItems.dishId, dishes.id))
                  .where(eq(orderItems.orderId, order.id));

                return { ...order, items };
              }),
            );

            const snapshot = JSON.stringify(ordersWithItems);
            if (snapshot !== lastSnapshot) {
              lastSnapshot = snapshot;
              send({ type: "orders", orders: ordersWithItems });
            } else {
              send({ type: "heartbeat" });
            }
          } catch {
            send({ type: "error", message: "Poll failed" });
          }
        };

        await poll();
        const interval = setInterval(poll, 2000);

        c.req.raw.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    },
  );
}

export { adminAuth };
