import { NextResponse } from "next/server";
import { constructStripeEvent, processStripeEvent } from "@/lib/stripe/webhook";

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const event = await constructStripeEvent(body, request.headers.get("stripe-signature"));
    await processStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 400 });
  }
}
