"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESETS = [10, 25, 50, 100] as const;

/**
 * Preset amount chooser. The previous version rendered the preset amounts as
 * inert `<span>` chips that looked tappable but did nothing — these are real
 * buttons that fill the amount field, with the custom field still available.
 */
export function DonationAmount({ defaultAmount = 25 }: { defaultAmount?: number }) {
  const [amount, setAmount] = useState(String(defaultAmount));

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="mb-2 block text-sm font-medium">Choose an amount</legend>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => {
            const selected = amount === String(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmount(String(p))}
                className={cn(
                  "min-h-11 rounded-xl border text-sm font-semibold transition-colors",
                  selected
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800",
                )}
              >
                S${p}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field
        label="Amount (SGD)"
        htmlFor="amount"
        hint="Any amount helps — give what feels right for you."
        required
      >
        <Input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </Field>
    </div>
  );
}
