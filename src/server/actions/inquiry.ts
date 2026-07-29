"use server";

import { z } from "zod";
import { db } from "@/db";
import { inquiry } from "@/db/schema";
import { audit } from "@/lib/audit";

const schema = z.object({
  type: z.enum(["contact", "partnership", "newsletter", "content_report"]),
  name: z.string().max(200).optional(),
  email: z.string().email().max(320).optional(),
  organization: z.string().max(200).optional(),
  subject: z.string().max(300).optional(),
  message: z.string().max(5000).optional(),
});

export type InquiryState = { ok: boolean; error?: string };

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const parsed = schema.safeParse({
    type: formData.get("type") ?? "contact",
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    organization: formData.get("organization") || undefined,
    subject: formData.get("subject") || undefined,
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: "Please check the form and try again." };
  }

  const [row] = await db
    .insert(inquiry)
    .values({ ...parsed.data, status: "new" })
    .returning({ id: inquiry.id });

  // Trackable rather than an unowned mailbox (PRD PAR-003).
  await audit({
    action: "inquiry.created",
    objectType: "inquiry",
    objectId: row.id,
    context: { type: parsed.data.type },
  });

  return { ok: true };
}
