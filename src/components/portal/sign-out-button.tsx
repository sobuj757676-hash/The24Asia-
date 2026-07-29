"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        // Purge personalized caches on sign-out (PRD 13.4).
        if (typeof caches !== "undefined") {
          try {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          } catch {
            /* ignore */
          }
        }
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
