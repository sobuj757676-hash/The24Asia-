import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { featureFlag } from "@/db/schema";

export { FLAGS } from "./flag-keys";
export type { FlagKey } from "./flag-keys";

/**
 * Feature flags gate high-risk capabilities until their governance decision
 * passes (PRD 30.2). Defaults to OFF when a flag row is missing.
 */
export const getFlag = cache(async (key: string): Promise<boolean> => {
  const rows = await db
    .select({ enabled: featureFlag.enabled })
    .from(featureFlag)
    .where(eq(featureFlag.key, key))
    .limit(1);
  return rows[0]?.enabled ?? false;
});
