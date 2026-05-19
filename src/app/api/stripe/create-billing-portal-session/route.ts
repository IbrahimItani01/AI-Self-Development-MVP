import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/auth/requireAdmin";
import { stripeClient } from "@/lib/stripe/server";

export async function POST() {
  const context = await getAdminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stripe = stripeClient();
  if (!stripe || !context.organization.stripeCustomerId) {
    return NextResponse.json({ error: "Billing portal is not available yet." }, { status: 400 });
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: context.organization.stripeCustomerId,
    return_url: `${appUrl}/dashboard/billing`,
  });
  return NextResponse.json({ url: session.url });
}
