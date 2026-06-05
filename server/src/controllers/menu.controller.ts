import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { useDB } from "./db/db";
import { categories, dishes, orderItems, orders } from "../schema/menu.schema";
import type { AppEnv } from "./common/types";

export async function getCategories(c: Context<AppEnv>) {
  const db = useDB(c);
  const result = await db.select().from(categories).orderBy(categories.name);
  return c.json(result);
}

export async function getDishes(c: Context<AppEnv>) {
  const db = useDB(c);
  const categoryId = c.req.query("categoryId");

  const query = db
    .select({
      id: dishes.id,
      categoryId: dishes.categoryId,
      name: dishes.name,
      description: dishes.description,
      price: dishes.price,
      imageUrl: dishes.imageUrl,
      createdAt: dishes.createdAt,
      categoryName: categories.name,
    })
    .from(dishes)
    .leftJoin(categories, eq(dishes.categoryId, categories.id));

  const result = categoryId
    ? await query.where(eq(dishes.categoryId, categoryId))
    : await query;

  return c.json(result);
}

export async function getDishById(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");

  const [dish] = await db
    .select({
      id: dishes.id,
      categoryId: dishes.categoryId,
      name: dishes.name,
      description: dishes.description,
      price: dishes.price,
      imageUrl: dishes.imageUrl,
      createdAt: dishes.createdAt,
      categoryName: categories.name,
    })
    .from(dishes)
    .leftJoin(categories, eq(dishes.categoryId, categories.id))
    .where(eq(dishes.id, id))
    .limit(1);

  if (!dish) {
    return c.json({ error: "Dish not found" }, 404);
  }

  return c.json(dish);
}

export async function createOrder(c: Context<AppEnv>) {
  const db = useDB(c);
  const body = await c.req.json<{
    items: Array<{ dishId: string; quantity: number; price: number }>;
    totalAmount: number;
  }>();

  if (!body.items?.length || body.totalAmount <= 0) {
    return c.json({ error: "Invalid order payload" }, 400);
  }

  const orderId = crypto.randomUUID();

  await db.insert(orders).values({
    id: orderId,
    totalAmount: body.totalAmount,
    status: "pending",
  });

  await db.insert(orderItems).values(
    body.items.map((item) => ({
      id: crypto.randomUUID(),
      orderId,
      dishId: item.dishId,
      quantity: item.quantity,
      priceAtPurchase: item.price,
    }))
  );

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  return c.json({ order, message: "Order placed successfully" }, 201);
}
