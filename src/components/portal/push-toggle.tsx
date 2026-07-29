"use client";

import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { savePushSubscription } from "@/server/actions/comms";

const noopSubscribe = () => () => {};

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushToggle() {
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [busy, setBusy] = useState(false);
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => "serviceWorker" in navigator && "PushManager" in window && !!vapid,
    () => false,
  );

  if (!supported) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Push notifications are not available on this device/browser.
      </p>
    );
  }

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Notifications permission denied.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid!),
      });
      const json = sub.toJSON();
      await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      });
      toast.success("Push notifications enabled.");
    } catch {
      toast.error("Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={enable} disabled={busy} variant="outline" size="sm">
      <Bell className="size-4" aria-hidden />
      {busy ? "…" : "Enable push notifications"}
    </Button>
  );
}
