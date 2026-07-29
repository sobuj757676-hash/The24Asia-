import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "@/env";
import * as schema from "./schema";

/**
 * Neon serverless HTTP driver - ideal for Next.js server components and edge.
 * For transactional multi-statement work use a pooled connection.
 */
const sql = neon(env.DATABASE_URL);

export const db = drizzle(sql, { schema, casing: "snake_case" });

export type Database = typeof db;
export { schema };
