import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/auth/requireAdmin";
import { getSubscriptionPlan } from "@/lib/db/plans";
import { canStartCheckout, planStripePriceId, stripeClient } from "@/lib/stripe/server";

const schema = z.object({
  organizationId: z.string().min(1),
  planId: z.string().min(1).default("pro"),
});

export async function POST(request: Request) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const input = schema.parse(await request.json());
  if (input.organizationId !== context.organization.id) {
    return NextResponse.json({ error: "Organization mismatch" }, { status: 403 });
  }

  const stripe = stripeClient();
  const plan = await getSubscriptionPlan(input.planId);
  if (!plan) return NextResponse.json({ error: "Selected plan is not available." }, { status: 400 });
  const price = planStripePriceId(plan);
  if (!stripe || !price) {
    return NextResponse.json({ error: "Stripe is not configured for this environment." }, { status: 400 });
  }
  if (!canStartCheckout(context.organization)) {
    return NextResponse.json({ error: "This organization already has an active subscription." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
    customer: context.organization.stripeCustomerId ?? undefined,
    client_reference_id: context.organization.id,
    metadata: { organizationId: context.organization.id, plan: plan.id },
    subscription_data: { metadata: { organizationId: context.organization.id, plan: plan.id } },
  });

  return NextResponse.json({ url: session.url });
}
