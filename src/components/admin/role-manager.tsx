"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/status-badge";
import { grantRole, revokeRole } from "@/server/actions/admin";

const ROLE_GROUPS: { label: string; roles: string[] }[] = [
  { label: "Community", roles: ["member", "volunteer", "trainer", "mentor"] },
  { label: "Staff", roles: ["coordinator", "content_author", "translator", "publisher", "finance"] },
  { label: "Restricted", roles: ["support_coordinator", "moderator", "safeguarding_lead", "auditor"] },
  { label: "Administration", roles: ["admin"] },
  { label: "External", roles: ["partner_contact"] },
];

/** Roles that carry elevated or sensitive access and get a confirmation. */
const SENSITIVE = new Set(["admin", "safeguarding_lead", "finance", "moderator", "auditor"]);

export function RoleManager({
  personId,
  roles,
}: {
  personId: string | null;
  roles: { id: string; role: string }[];
}) {
  const [role, setRole] = useState("member");
  const [pending, start] = useTransition();

  if (!personId) {
    return (
      <span className="text-xs text-[var(--muted)]">
        No profile yet — they must sign in once
      </span>
    );
  }

  const held = new Set(roles.map((r) => r.role));

  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
      {roles.length === 0 ? (
        <span className="text-xs text-[var(--muted)]">No roles</span>
      ) : (
        roles.map((r) => (
          <span key={r.id} className="inline-flex items-center gap-1">
            <Badge tone={SENSITIVE.has(r.role) ? "warning" : "info"}>{r.role}</Badge>
            <button
              type="button"
              aria-label={`Remove role ${r.role}`}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  try {
                    await revokeRole(r.id);
                    toast.success(`Removed ${r.role}`);
                  } catch {
                    toast.error("Could not remove that role.");
                  }
                })
              }
              className="grid size-5 place-items-center rounded text-ink-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/30"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        ))
      )}

      <label htmlFor={`role-${personId}`} className="sr-only">
        Role to grant
      </label>
      <select
        id={`role-${personId}`}
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="h-9 rounded-lg border border-ink-300 bg-[var(--card)] px-2 text-sm"
      >
        {ROLE_GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.roles.map((r) => (
              <option key={r} value={r} disabled={held.has(r)}>
                {r}
                {held.has(r) ? " (held)" : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <Button
        size="sm"
        variant="outline"
        disabled={pending || held.has(role)}
        aria-busy={pending}
        onClick={() => {
          if (
            SENSITIVE.has(role) &&
            !window.confirm(
              `Grant the elevated “${role}” role? This gives access to sensitive areas and is audited.`,
            )
          ) {
            return;
          }
          start(async () => {
            try {
              await grantRole(personId, role);
              toast.success(`Granted ${role}`);
            } catch {
              toast.error("Could not grant that role.");
            }
          });
        }}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Plus className="size-4" aria-hidden />
        )}
        Grant
      </Button>
    </div>
  );
}
