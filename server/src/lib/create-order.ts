import { eq, inArray, sql } from "drizzle-orm";
import type { useDB } from "./db/db";
import { createId } from "./auth";
import { dishes, orderItems, orders, type OrderStatus } from "../schema/menu.schema";

export type OrderLineInput = {
  dishId: string;
  quantity: number;
};

export type InsertOrderOptions = {
  status?: OrderStatus;
  customerName?: string | null;
};

export class OrderValidationError extends Error {
  constructor(
    message: string,
    readonly status: number = 400
  ) {
    super(message);
  }
}

async function getNextOrderNumber(db: ReturnType<typeof useDB>) {
  const [row] = await db
    .select({ max: sql<number>`coalesce(max(${orders.orderNumber}), 0)` })
    .from(orders);
  return (row?.max ?? 0) + 1;
}

export async function insertOrder(
  db: ReturnType<typeof useDB>,
  items: OrderLineInput[],
  options: InsertOrderOptions = {}
) {
  const status = options.status ?? "pending";
  const customerName = options.customerName?.trim() || null;

  if (!items.length) {
    throw new OrderValidationError("Order must include at least one item");
  }

  const merged = new Map<string, number>();
  for (const item of items) {
    if (!item.dishId || item.quantity <= 0) {
      throw new OrderValidationError("Invalid order item");
    }
    merged.set(item.dishId, (merged.get(item.dishId) ?? 0) + item.quantity);
  }

  const dishIds = [...merged.keys()];
  const dbDishes = await db
    .select({ id: dishes.id, price: dishes.price, name: dishes.name })
    .from(dishes)
    .where(inArray(dishes.id, dishIds));

  if (dbDishes.length !== dishIds.length) {
    throw new OrderValidationError("One or more dishes are unavailable", 404);
  }

  const priceMap = new Map(dbDishes.map((d) => [d.id, d.price]));
  const nameMap = new Map(dbDishes.map((d) => [d.id, d.name]));

  let totalAmount = 0;
  const orderItemRows = dishIds.map((dishId) => {
    const quantity = merged.get(dishId)!;
    const price = priceMap.get(dishId)!;
    totalAmount += price * quantity;
    return {
      id: createId(),
      dishId,
      dishName: nameMap.get(dishId) ?? "Unknown",
      quantity,
      priceAtPurchase: price,
    };
  });

  const orderId = createId();
  const orderNumber = await getNextOrderNumber(db);

  await db.batch([
    db.insert(orders).values({
      id: orderId,
      orderNumber,
      customerName,
      totalAmount,
      status,
    }),
    ...orderItemRows.map((row) =>
      db.insert(orderItems).values({
        id: row.id,
        orderId,
        dishId: row.dishId,
        dishName: row.dishName,
        quantity: row.quantity,
        priceAtPurchase: row.priceAtPurchase,
      })
    ),
  ]);

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  const savedItems = await db
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
    .where(eq(orderItems.orderId, orderId));

  return { ...order!, items: savedItems };
}
