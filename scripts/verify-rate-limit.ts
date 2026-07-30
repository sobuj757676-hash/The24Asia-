/**
 * Verifies the fixed-window rate limiter against a real database, including
 * that the window resets. Run with:
 *   pnpm tsx --env-file=.env scripts/verify-rate-limit.ts
 */
import { sql } from "drizzle-orm";
import { db } from "../src/db";
import { rateLimit } from "../src/db/schema";
import { checkRateLimit, LIMITS } from "../src/lib/rate-limit";

async function main() {
  const id = `verify-${Date.now()}`;
  const key = `inquiry:${id}`;
  await db.delete(rateLimit).where(sql`${rateLimit.key} = ${key}`);

  const max = LIMITS.inquiry.max;
  const results: boolean[] = [];
  for (let i = 0; i < max + 2; i++) {
    const { ok } = await checkRateLimit("inquiry", id);
    results.push(ok);
  }

  const allowed = results.filter(Boolean).length;
  console.log(`allowed ${allowed} of ${results.length} (limit ${max})`);
  if (allowed !== max) throw new Error(`expected exactly ${max} allowed, got ${allowed}`);

  // Age the window past its expiry and confirm the counter resets.
  await db
    .update(rateLimit)
    .set({ windowStart: sql`now() - interval '2 hours'` })
    .where(sql`${rateLimit.key} = ${key}`);
  const afterReset = await checkRateLimit("inquiry", id);
  if (!afterReset.ok) throw new Error("window did not reset");
  console.log("window reset: ok");

  // Concurrency: parallel calls must not slip past the limit.
  const id2 = `${id}-par`;
  const parallel = await Promise.all(
    Array.from({ length: max + 5 }, () => checkRateLimit("inquiry", id2)),
  );
  const parallelAllowed = parallel.filter((r) => r.ok).length;
  console.log(`parallel allowed ${parallelAllowed} of ${parallel.length}`);
  if (parallelAllowed > max) throw new Error("limiter leaked under concurrency");

  await db.delete(rateLimit).where(sql`${rateLimit.key} in (${key}, ${`inquiry:${id2}`})`);
  console.log("rate limiter verified");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
