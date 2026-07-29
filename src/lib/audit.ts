import { db } from "@/db";
import { auditEvent } from "@/db/schema";

type AuditArgs = {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  objectType: string;
  objectId?: string | null;
  outcome?: "success" | "denied" | "error";
  reason?: string | null;
  context?: Record<string, unknown>;
  correlationId?: string | null;
};

/**
 * Append-only audit write (PRD 19.2). Never store tokens, secrets, request
 * bodies or unnecessary personal values - only ids and minimal context.
 */
export async function audit(args: AuditArgs): Promise<void> {
  try {
    await db.insert(auditEvent).values({
      actorId: args.actorId ?? null,
      actorRole: args.actorRole ?? null,
      action: args.action,
      objectType: args.objectType,
      objectId: args.objectId ?? null,
      outcome: args.outcome ?? "success",
      reason: args.reason ?? null,
      context: args.context,
      correlationId: args.correlationId ?? null,
    });
  } catch (e) {
    // Audit must never break the main flow, but surface failures.
    console.error("[audit] failed to write event", args.action, e);
  }
}
