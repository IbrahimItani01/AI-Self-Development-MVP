"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CheckoutButton({
  organizationId,
  planId = "pro",
  label = "Continue to secure payment",
  disabled = false,
}: {
  organizationId: string;
  planId?: string;
  label?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openCheckout() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ organizationId, planId }),
    });
    const data = (await response.json()) as { url?: string; error?: string };
    setLoading(false);
    if (!response.ok || !data.url) {
      setError(data.error || "Unable to start checkout.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-2">
      <Button className="w-full" disabled={disabled || loading} onClick={openCheckout}>
        {loading ? "Opening checkout..." : label}
      </Button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
