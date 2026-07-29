"use server";

import { z } from "zod";
import { db } from "@/db";
import { timeEntry } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

/** Log volunteer hours; goes to supervisor approval (PRD VOL-010). */
export async function logHours(formData: FormData): Promise<void> {
  const user = await requireUser();
  const parsed = z
    .object({
      hours: z.coerce.number().positive().max(24),
      activityDate: z.string().min(1),
      note: z.string().max(1000).optional(),
    })
    .safeParse({
      hours: formData.get("hours"),
      activityDate: formData.get("activityDate"),
      note: formData.get("note") || undefined,
    });
  if (!parsed.success) return;

  const [row] = await db
    .insert(timeEntry)
    .values({
      personId: user.personId,
      hours: String(parsed.data.hours),
      activityDate: new Date(parsed.data.activityDate),
      note: parsed.data.note,
      approved: false,
    })
    .returning({ id: timeEntry.id });

  await audit({
    actorId: user.personId,
    action: "time_entry.submitted",
    objectType: "time_entry",
    objectId: row.id,
  });
}
