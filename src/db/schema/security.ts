import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Fixed-window rate limit counters (PRD 19.x abuse prevention).
 *
 * Deliberately database-backed rather than in-memory: the app runs on
 * serverless functions, so a per-instance counter would reset on every cold
 * start and let an attacker spread traffic across instances for free. One
 * upsert per guarded request is cheap next to the insert it is protecting.
 */
export const rateLimit = pgTable(
  "rate_limit",
  {
    // `${bucket}:${identifier}` — e.g. "donate:203.0.113.4"
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(0),
    windowStart: timestamp("window_start", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("rate_limit_window_idx").on(t.windowStart)],
);
