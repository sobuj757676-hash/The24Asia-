"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { moderateReport, approvePost } from "@/server/actions/community";

export function ReportActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="danger" disabled={pending}
        onClick={() => start(async () => { await moderateReport(id, "remove"); toast.success("Removed"); })}>
        Remove
      </Button>
      <Button size="sm" variant="outline" disabled={pending}
        onClick={() => start(async () => { await moderateReport(id, "warning"); toast.success("Warned"); })}>
        Warn
      </Button>
      <Button size="sm" variant="ghost" disabled={pending}
        onClick={() => start(async () => { await moderateReport(id, "dismiss"); toast.success("Dismissed"); })}>
        Dismiss
      </Button>
    </div>
  );
}

export function ApprovePostButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" disabled={pending}
      onClick={() => start(async () => { await approvePost(id); toast.success("Approved"); })}>
      Approve
    </Button>
  );
}
