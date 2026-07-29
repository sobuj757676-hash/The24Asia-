import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_shared";
import { person } from "./identity";
import { mediaAsset } from "./cms";

/** Merchandise product (PRD MER, 8.13). */
export const product = pgTable("product", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  imageId: text("image_id").references(() => mediaAsset.id),
  priceCents: integer("price_cents").notNull().default(0),
  currency: text("currency").notNull().default("SGD"),
  published: boolean("published").notNull().default(false),
  ...timestamps,
});

/** Size/colour variant with its own stock. */
export const productVariant = pgTable(
  "product_variant",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    label: text("label").notNull(), // "M", "L / Green"
    stock: integer("stock").notNull().default(0),
    reorderThreshold: integer("reorder_threshold").notNull().default(5),
    ...timestamps,
  },
  (t) => [index("variant_product_idx").on(t.productId)],
);

export const orderStatus = pgEnum("order_status", [
  "cart",
  "submitted",
  "awaiting_payment",
  "confirmed",
  "ready",
  "fulfilled",
  "cancelled",
  "refunded",
]);

export const shopOrder = pgTable(
  "shop_order",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id").references(() => person.id, {
      onDelete: "set null",
    }),
    status: orderStatus("status").notNull().default("cart"),
    fulfilment: text("fulfilment").notNull().default("pickup"), // pickup | delivery
    purpose: text("purpose"),
    totalCents: integer("total_cents").notNull().default(0),
    currency: text("currency").notNull().default("SGD"),
    providerReference: text("provider_reference"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("order_person_idx").on(t.personId)],
);

export const orderLine = pgTable(
  "order_line",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => shopOrder.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariant.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull().default(1),
    unitPriceCents: integer("unit_price_cents").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("line_order_idx").on(t.orderId)],
);

/** Organization asset register (PRD MER-004). */
export const asset = pgTable("asset", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  category: text("category").notNull(),
  identifier: text("identifier").notNull().unique(),
  name: text("name").notNull(),
  custodianId: text("custodian_id").references(() => person.id),
  location: text("location"),
  condition: text("condition").notNull().default("good"),
  valueBand: text("value_band"),
  disposedAt: timestamp("disposed_at", { withTimezone: true }),
  ...timestamps,
});

export const stockMovement = pgTable("stock_movement", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  variantId: text("variant_id")
    .notNull()
    .references(() => productVariant.id, { onDelete: "cascade" }),
  delta: integer("delta").notNull(),
  reason: text("reason").notNull(),
  actorId: text("actor_id").references(() => person.id),
  ...timestamps,
});

export const expenseStatus = pgEnum("expense_status", [
  "submitted",
  "approved",
  "rejected",
  "paid",
]);

/** Volunteer expense claim (PRD VOL-013). */
export const expenseClaim = pgTable(
  "expense_claim",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("SGD"),
    category: text("category"),
    description: text("description"),
    receiptStorageKey: text("receipt_storage_key"),
    status: expenseStatus("status").notNull().default("submitted"),
    approvedById: text("approved_by_id").references(() => person.id),
    ...timestamps,
  },
  (t) => [index("expense_person_idx").on(t.personId)],
);
