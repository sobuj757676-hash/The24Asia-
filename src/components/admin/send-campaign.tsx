"use client";

import { Send } from "lucide-react";
import { ConfirmAction } from "@/components/ui/confirm-dialog";
import { sendCampaign } from "@/server/actions/comms";

export function SendCampaignButton({ id, recipients }: { id: string; recipients?: number }) {
  return (
    <ConfirmAction
      action={async () => {
        await sendCampaign(id);
      }}
      triggerLabel="Send"
      triggerVariant="primary"
      triggerIcon={<Send className="size-4" aria-hidden />}
      title="Send this campaign?"
      description={
        recipients !== undefined
          ? `This will deliver the message to approximately ${recipients} consenting recipients. Sending cannot be undone.`
          : "This will deliver the message to everyone who has consented to this topic. Sending cannot be undone."
      }
      confirmLabel="Send now"
      successMessage="Campaign sent"
    />
  );
}
