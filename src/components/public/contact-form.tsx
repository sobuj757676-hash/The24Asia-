"use client";

import { useActionState } from "react";
import { submitInquiry, type InquiryState } from "@/server/actions/inquiry";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const initial: InquiryState = { ok: false };

export function ContactForm({ type = "contact" }: { type?: string }) {
  const [state, action, pending] = useActionState(submitInquiry, initial);

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-brand-500 bg-brand-50 p-4 text-brand-800 dark:bg-brand-900/20">
        <CheckCircle2 className="size-5" aria-hidden />
        <p>Thank you. We received your message and will be in touch.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      <Field label="Your name" htmlFor="name">
        <Input id="name" name="name" autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      {type === "partnership" && (
        <Field label="Organization" htmlFor="organization">
          <Input id="organization" name="organization" />
        </Field>
      )}
      <Field label="Subject" htmlFor="subject">
        <Input id="subject" name="subject" />
      </Field>
      <Field label="Message" htmlFor="message" required>
        <Textarea id="message" name="message" required />
      </Field>
      {state.error && (
        <p role="alert" className="text-sm text-danger-fg">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
