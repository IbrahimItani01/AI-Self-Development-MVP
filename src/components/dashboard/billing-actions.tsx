"use client";

import { useState } from "react";
import { Button, SecondaryButton } from "@/components/ui/button";

export function BillingActions({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openCheckout() {
    setLoading("pro");
    setError(null);
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationId }),
    });
    const data = (await response.json()) as { url?: string; error?: string };
    setLoading(null);
    if (!response.ok || !data.url) {
      setError(data.error || "Unable to start checkout.");
      return;
    }
    window.location.href = data.url;
  }

  async function openPortal() {
    setLoading("portal");
    setError(null);
    const response = await fetch("/api/stripe/create-billing-portal-session", { method: "POST" });
    const data = (await response.json()) as { url?: string; error?: string };
    setLoading(null);
    if (!response.ok || !data.url) {
      setError(data.error || "Billing portal is not available.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button disabled={Boolean(loading)} onClick={openCheckout}>
          {loading === "pro" ? "Opening..." : "Start Pro Plan"}
        </Button>
        <SecondaryButton disabled={Boolean(loading)} onClick={openPortal}>
          {loading === "portal" ? "Opening..." : "Open Billing Portal"}
        </SecondaryButton>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
