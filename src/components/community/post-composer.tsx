"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PII = /(\+?\d[\d\s-]{7,}\d)|([\w.+-]+@[\w-]+\.[\w.-]+)/;

/**
 * Composer that warns before publishing likely personal information such as
 * phone numbers or emails (PRD COM-004). The server action still enforces
 * moderation status.
 */
export function PostComposer({
  action,
  placeholder = "Share something with the group…",
  label = "Post",
}: {
  action: (formData: FormData) => void;
  placeholder?: string;
  label?: string;
}) {
  const [value, setValue] = useState("");
  const hasPII = PII.test(value);

  return (
    <form action={action} className="space-y-2">
      <Textarea
        name="body"
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
      />
      {hasPII && (
        <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
          Heads up: this looks like it contains a phone number or email. Please
          avoid sharing personal contact details publicly.
        </p>
      )}
      <Button type="submit" size="sm">{label}</Button>
    </form>
  );
}
