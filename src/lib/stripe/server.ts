import Stripe from "stripe";

export function stripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
}

export function proPriceId(): string | null {
  return process.env.STRIPE_PRICE_ID_PRO || null;
}

export function mapStripeStatus(status?: string): "active" | "trial" | "past_due" | "canceled" | "inactive" {
  if (status === "active") return "active";
  if (status === "trialing") return "trial";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "inactive";
}
