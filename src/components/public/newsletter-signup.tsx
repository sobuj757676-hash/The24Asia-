"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
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
      <p className="flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300">
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        Thanks for subscribing!
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      {/*
        Stacked on narrow columns, inline once there is room. The previous
        single-row `flex` collapsed the input to ~50px inside the footer's
        narrow first column, truncating the placeholder to "Your".
      */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-label="Email address for the newsletter"
          aria-describedby={state.error ? "newsletter-error" : undefined}
          className="h-11 min-w-0 flex-1"
        />
        <Button type="submit" disabled={pending} aria-busy={pending} className="shrink-0">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? "Joining…" : "Subscribe"}
        </Button>
      </div>
      <div aria-live="polite">
        {state.error && (
          <p id="newsletter-error" role="alert" className="text-xs text-danger-fg">
            {state.error}
          </p>
        )}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Occasional updates about courses and events. Unsubscribe any time.
      </p>
    </form>
  );
}
