import "server-only";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimit } from "@/db/schema";

/** Named limits for the publicly reachable server actions. */
export const LIMITS = {
  /** Starting a donation creates a DB row and a provider checkout. */
  donate: { max: 10, windowSeconds: 600 },
  /** Contact / partnership / report forms — the classic spam target. */
  inquiry: { max: 5, windowSeconds: 600 },
  /** Newsletter subscribe: prevents signing strangers up en masse. */
  newsletter: { max: 3, windowSeconds: 3600 },
  /** Shop checkout. */
  order: { max: 10, windowSeconds: 600 },
  /** Support intake — generous, because a person in trouble may retry. */
  support: { max: 8, windowSeconds: 600 },
  /** Community posting and reporting. */
  community: { max: 20, windowSeconds: 600 },
} as const;

export type LimitName = keyof typeof LIMITS;

export class RateLimitError extends Error {
  constructor(message = "Too many attempts. Please wait a few minutes and try again.") {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Best-effort client identity. Vercel and most proxies set x-forwarded-for;
 * we take the left-most entry, which is the original client.
 */
async function clientKey() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "unknown";
  return ip;
}

/**
 * Fixed-window limiter. Returns `{ ok, remaining }`; call `enforce` when you
 * want it to throw instead.
 *
 * The whole decision is a single atomic upsert: if the stored window has
 * expired the row is reset, otherwise the counter increments. No read-then-
 * write race, so concurrent requests cannot slip past the limit.
 */
export async function checkRateLimit(
  name: LimitName,
  identifier?: string,
): Promise<{ ok: boolean; remaining: number }> {
  const { max, windowSeconds } = LIMITS[name];
  const key = `${name}:${identifier ?? (await clientKey())}`;

  try {
    const [row] = await db
      .insert(rateLimit)
      .values({ key, count: 1 })
      .onConflictDoUpdate({
        target: rateLimit.key,
        set: {
          count: sql`CASE
            WHEN ${rateLimit.windowStart} < now() - ${sql.raw(`interval '${windowSeconds} seconds'`)}
            THEN 1
            ELSE ${rateLimit.count} + 1
          END`,
          windowStart: sql`CASE
            WHEN ${rateLimit.windowStart} < now() - ${sql.raw(`interval '${windowSeconds} seconds'`)}
            THEN now()
            ELSE ${rateLimit.windowStart}
          END`,
        },
      })
      .returning({ count: rateLimit.count });

    const count = row?.count ?? 1;
    return { ok: count <= max, remaining: Math.max(max - count, 0) };
  } catch {
    // Never let the limiter itself take a public form offline. Failing open on
    // an infrastructure error is the right trade-off for a donation or a
    // support request; the guarded action still validates its own input.
    return { ok: true, remaining: max };
  }
}

/** Throws {@link RateLimitError} when the caller is over the limit. */
export async function enforceRateLimit(name: LimitName, identifier?: string) {
  const { ok } = await checkRateLimit(name, identifier);
  if (!ok) throw new RateLimitError();
}

/**
 * Housekeeping: drop counters whose window closed long ago. Safe to call from
 * any admin request; keeps the table from growing without bound.
 */
export async function pruneRateLimits() {
  await db.delete(rateLimit).where(sql`${rateLimit.windowStart} < now() - interval '1 day'`);
}
