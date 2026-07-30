"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, Clock, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/ui/confirm-dialog";
import {
  decideCourseApplication,
  decideVolunteerApplication,
} from "@/server/actions/admin";

/**
 * Review controls for application queues. Approving is a single click (the
 * common, reversible path); declining asks for confirmation because it sends a
 * decision to the applicant.
 */
export function CourseReviewButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();

  const run = (
    decision: "approved" | "waitlisted",
    message: string,
  ) =>
    start(async () => {
      try {
        await decideCourseApplication(id, decision);
        toast.success(message);
      } catch {
        toast.error("Could not update the application. Please try again.");
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" disabled={pending} aria-busy={pending} onClick={() => run("approved", "Approved and enrolled")}>
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
        Approve
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run("waitlisted", "Moved to waitlist")}>
        <Clock className="size-4" aria-hidden />
        Waitlist
      </Button>
      <ConfirmAction
        action={async () => {
          await decideCourseApplication(id, "declined");
        }}
        triggerLabel="Decline"
        triggerVariant="ghost"
        title="Decline this application?"
        description="The applicant will be notified of the decision. You can still enrol them in a future batch."
        confirmLabel="Decline"
        destructive
        successMessage="Application declined"
      />
    </div>
  );
}

export function VolunteerReviewButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        disabled={pending}
        aria-busy={pending}
        onClick={() =>
          start(async () => {
            try {
              await decideVolunteerApplication(id, "approved");
              toast.success("Volunteer approved");
            } catch {
              toast.error("Could not update the application. Please try again.");
            }
          })
        }
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />}
        Approve
      </Button>
      <ConfirmAction
        action={async () => {
          await decideVolunteerApplication(id, "declined");
        }}
        triggerLabel="Decline"
        triggerVariant="ghost"
        triggerIcon={<X className="size-4" aria-hidden />}
        title="Decline this volunteer application?"
        description="The applicant will be notified. Declining is recorded with your name for accountability."
        confirmLabel="Decline"
        destructive
        successMessage="Application declined"
      />
    </div>
  );
}
