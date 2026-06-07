import { eq, inArray } from "drizzle-orm";
import type { Context } from "hono";
import { useDB } from "../lib/db/db";
import { jsonError } from "../lib/api-response";
import { formatDishResponse } from "../lib/dish-images";
import {
  insertOrder,
  OrderValidationError,
} from "../lib/create-order";
import { categories, dishes } from "../schema/menu.schema";
import type { AppEnv } from "../lib/common/types";

const dishSelect = {
  id: dishes.id,
  categoryId: dishes.categoryId,
  name: dishes.name,
  description: dishes.description,
  price: dishes.price,
  imageUrl: dishes.imageUrl,
  imageUrls: dishes.imageUrls,
  createdAt: dishes.createdAt,
  categoryName: categories.name,
};

export async function getCategories(c: Context<AppEnv>) {
  const db = useDB(c);
  const result = await db.select().from(categories).orderBy(categories.name);
  return c.json(result);
}

export async function getDishes(c: Context<AppEnv>) {
  const db = useDB(c);
  const categoryId = c.req.query("categoryId");

  const query = db
    .select(dishSelect)
    .from(dishes)
    .leftJoin(categories, eq(dishes.categoryId, categories.id))
    .orderBy(dishes.name);

  const result = categoryId
    ? await query.where(eq(dishes.categoryId, categoryId))
    : await query;

  return c.json(result.map(formatDishResponse));
}

export async function getDishById(c: Context<AppEnv>) {
  const db = useDB(c);
  const id = c.req.param("id");

  const [dish] = await db
    .select(dishSelect)
    .from(dishes)
    .leftJoin(categories, eq(dishes.categoryId, categories.id))
    .where(eq(dishes.id, id))
    .limit(1);

  if (!dish) {
    return jsonError(c, "Dish not found", 404);
  }

  return c.json(formatDishResponse(dish));
}

export async function createOrder(c: Context<AppEnv>) {
  const db = useDB(c);
  const body = await c.req.json<{
    items: Array<{ dishId: string; quantity: number; price: number }>;
    totalAmount: number;
    customerName?: string;
  }>();

  if (!body.items?.length || body.totalAmount <= 0) {
    return jsonError(c, "Invalid order payload");
  }

  for (const item of body.items) {
    if (!item.dishId || item.quantity <= 0 || item.price <= 0) {
      return jsonError(c, "Invalid order item");
    }
  }

  const dishIds = body.items.map((item) => item.dishId);
  const dbDishes = await db
    .select({ id: dishes.id, price: dishes.price })
    .from(dishes)
    .where(inArray(dishes.id, dishIds));

  if (dbDishes.length !== dishIds.length) {
    return jsonError(c, "One or more dishes are unavailable", 404);
  }

  const priceMap = new Map(dbDishes.map((d) => [d.id, d.price]));

  let computedTotal = 0;
  for (const item of body.items) {
    const dbPrice = priceMap.get(item.dishId);
    if (dbPrice === undefined) {
      return jsonError(c, "One or more dishes are unavailable", 404);
    }
    if (dbPrice !== item.price) {
      return jsonError(c, "Order prices are out of date. Refresh and try again.");
    }
    computedTotal += dbPrice * item.quantity;
  }

  if (computedTotal !== body.totalAmount) {
    return jsonError(c, "Order total mismatch. Refresh and try again.");
  }

  try {
    const order = await insertOrder(
      db,
      body.items.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
      })),
      { customerName: body.customerName }
    );
    return c.json({ order, message: "Order placed successfully" }, 201);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return jsonError(c, err.message, err.status);
    }
    throw err;
  }
}
