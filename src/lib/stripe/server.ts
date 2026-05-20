import Stripe from "stripe";
import type { Organization, SubscriptionPlan } from "@/types";

export function stripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });
}

export function proPriceId(): string | null {
  return process.env.STRIPE_PRICE_ID_PRO || null;
}

export function planStripePriceId(plan: SubscriptionPlan): string | null {
  return plan.stripePriceId || (plan.id === "pro" ? proPriceId() : null);
}

export async function createStripeCustomerForOrganization(input: {
  organizationName: string;
  adminEmail: string;
  adminName: string;
  organizationId: string;
}): Promise<string | null> {
  const stripe = stripeClient();
  if (!stripe) return null;

  const customer = await stripe.customers.create({
    name: input.organizationName,
    email: input.adminEmail,
    metadata: {
      organizationId: input.organizationId,
      adminName: input.adminName,
    },
  });

  return customer.id;
}

export function canStartCheckout(organization: Organization): boolean {
  return !["active", "trial"].includes(organization.status) || !organization.stripeSubscriptionId;
}

export async function cancelStripeSubscriptionNow(subscriptionId: string): Promise<void> {
  const stripe = stripeClient();
  if (!stripe) throw new Error("Stripe is not configured, so the active subscription cannot be canceled automatically.");
  await stripe.subscriptions.cancel(subscriptionId);
}

export async function deleteStripeCustomerNow(customerId: string): Promise<void> {
  const stripe = stripeClient();
  if (!stripe) throw new Error("Stripe is not configured, so the linked customer cannot be deleted automatically.");
  await stripe.customers.del(customerId);
}

export function mapStripeStatus(status?: string): "active" | "trial" | "past_due" | "canceled" | "inactive" {
  if (status === "active") return "active";
  if (status === "trialing") return "trial";
  if (status === "past_due" || status === "unpaid") return "past_due";
  if (status === "canceled" || status === "incomplete_expired") return "canceled";
  return "inactive";
}
