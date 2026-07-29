"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  decideCourseApplication,
  decideVolunteerApplication,
} from "@/server/actions/admin";

export function CourseReviewButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await decideCourseApplication(id, "approved");
            toast.success("Approved & enrolled");
          })
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await decideCourseApplication(id, "waitlisted");
            toast.success("Waitlisted");
          })
        }
      >
        Waitlist
      </Button>
      <Button
        size="sm"
        variant="danger"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await decideCourseApplication(id, "declined");
            toast.success("Declined");
          })
        }
      >
        Decline
      </Button>
    </div>
  );
}

export function VolunteerReviewButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await decideVolunteerApplication(id, "approved");
            toast.success("Approved");
          })
        }
      >
        Approve
      </Button>
      <Button
        size="sm"
        variant="danger"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await decideVolunteerApplication(id, "declined");
            toast.success("Declined");
          })
        }
      >
        Decline
      </Button>
    </div>
  );
}
