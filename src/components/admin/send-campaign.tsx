"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendCampaign } from "@/server/actions/comms";

export function SendCampaignButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Send this campaign to the eligible audience?")) return;
        start(async () => {
          await sendCampaign(id);
          toast.success("Campaign sent");
        });
      }}
    >
      {pending ? "Sending…" : "Send"}
    </Button>
  );
}
