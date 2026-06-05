import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { useDB } from "../lib/db/db";
import {
  adminAuth,
  createId,
  signAdminToken,
  validateAdminCredentials,
} from "../lib/auth";
import {
  categories,
  dishes,
  orderItems,
  orders,
  type OrderStatus,
} from "../schema/menu.schema";
import type { AppEnv } from "../lib/common/types";

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

  await db.delete(categories).where(eq(categories.id, id));
  return c.json({ success: true });
}

export async function createDish(c: Context<AppEnv>) {
  const db = useDB(c);
  const body = await c.req.json<{
    name: string;
    categoryId: string;
    price: number;
    imageUrl: string;
    description?: string;
  }>();

  if (!body.name || !body.categoryId || !body.imageUrl || body.price <= 0) {
    return c.json({ error: "Invalid dish payload" }, 400);
  }

  const [dish] = await db
    .insert(dishes)
    .values({
      id: createId(),
      name: body.name,
      categoryId: body.categoryId,
      price: body.price,
      imageUrl: body.imageUrl,
      description: body.description ?? null,
    })
    .returning();

  return c.json(dish, 201);
}

export async function deleteDish(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");

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
    { method: "POST", body: cloudinaryForm }
  );

  if (!response.ok) {
    const error = await response.text();
    return c.json({ error: "Upload failed", details: error }, 500);
  }

  const data = (await response.json()) as { secure_url: string; public_id: string };
  return c.json({ url: data.secure_url, publicId: data.public_id });
}

export async function getAdminOrders(c: Context<AppEnv>) {
  const db = useDB(c);
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(orders.createdAt);

  const ordersWithItems = await Promise.all(
    allOrders.map(async (order) => {
      const items = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          priceAtPurchase: orderItems.priceAtPurchase,
          dishId: orderItems.dishId,
          dishName: dishes.name,
          dishImageUrl: dishes.imageUrl,
        })
        .from(orderItems)
        .leftJoin(dishes, eq(orderItems.dishId, dishes.id))
        .where(eq(orderItems.orderId, order.id));

      return { ...order, items };
    })
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

export async function ordersStream(c: Context<AppEnv>) {
  const db = useDB(c);

  return c.newResponse(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let lastSnapshot = "";

        const send = (data: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        send({ type: "connected" });

        const poll = async () => {
          try {
            const allOrders = await db
              .select()
              .from(orders)
              .orderBy(orders.createdAt);

            const ordersWithItems = await Promise.all(
              allOrders.map(async (order) => {
                const items = await db
                  .select({
                    id: orderItems.id,
                    quantity: orderItems.quantity,
                    priceAtPurchase: orderItems.priceAtPurchase,
                    dishId: orderItems.dishId,
                    dishName: dishes.name,
                  })
                  .from(orderItems)
                  .leftJoin(dishes, eq(orderItems.dishId, dishes.id))
                  .where(eq(orderItems.orderId, order.id));

                return { ...order, items };
              })
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
    }
  );
}

export { adminAuth };
