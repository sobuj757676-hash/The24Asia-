"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { grantRole, revokeRole } from "@/server/actions/admin";

const ROLES = [
  "member",
  "volunteer",
  "trainer",
  "mentor",
  "coordinator",
  "support_coordinator",
  "moderator",
  "safeguarding_lead",
  "content_author",
  "translator",
  "publisher",
  "finance",
  "auditor",
  "admin",
];

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
    return <span className="text-xs text-[var(--muted)]">No profile yet</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {roles.map((r) => (
        <span key={r.id} className="inline-flex items-center gap-1">
          <Badge tone="brand">{r.role}</Badge>
          <button
            type="button"
            aria-label={`Remove ${r.role}`}
            className="text-xs text-danger"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await revokeRole(r.id);
                toast.success(`Removed ${r.role}`);
              })
            }
          >
            ✕
          </button>
        </span>
      ))}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="rounded-lg border border-ink-300 bg-transparent px-2 py-1 text-sm"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await grantRole(personId, role);
            toast.success(`Granted ${role}`);
          })
        }
      >
        Grant
      </Button>
    </div>
  );
}
