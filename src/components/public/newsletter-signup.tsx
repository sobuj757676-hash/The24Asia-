"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/server/actions/comms";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type State = { ok: boolean; error?: string };
const initial: State = { ok: false };

export function NewsletterSignup() {
  const [state, action, pending] = useActionState(
    async (_prev: State, fd: FormData) => subscribeNewsletter(fd),
    initial,
  );

  if (state.ok) {
    return (
      <p className="text-sm text-brand-700">Thanks for subscribing!</p>
    );
  }

  return (
    <form action={action} className="flex gap-2">
      <Input
        name="email"
        type="email"
        required
        placeholder="Your email"
        aria-label="Email for newsletter"
        className="h-10"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "…" : "Subscribe"}
      </Button>
    </form>
  );
}
