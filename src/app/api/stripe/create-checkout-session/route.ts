import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext } from "@/lib/auth/requireAdmin";
import { proPriceId, stripeClient } from "@/lib/stripe/server";

const schema = z.object({
  organizationId: z.string().min(1),
});

export async function POST(request: Request) {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const input = schema.parse(await request.json());
  if (input.organizationId !== context.organization.id) {
    return NextResponse.json({ error: "Organization mismatch" }, { status: 403 });
  }

  const stripe = stripeClient();
  const price = proPriceId();
  if (!stripe || !price) {
    return NextResponse.json({ error: "Stripe is not configured for this environment." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?checkout=success`,
    cancel_url: `${appUrl}/dashboard/billing?checkout=cancelled`,
    customer: context.organization.stripeCustomerId ?? undefined,
    client_reference_id: context.organization.id,
    metadata: { organizationId: context.organization.id, plan: "pro" },
    subscription_data: { metadata: { organizationId: context.organization.id, plan: "pro" } },
  });

  return NextResponse.json({ url: session.url });
}
