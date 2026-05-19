import Stripe from "stripe";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { updateOrganizationSubscription } from "@/lib/db/organizations";
import { mapStripeStatus, stripeClient } from "./server";

export async function constructStripeEvent(body: string, signature: string | null): Promise<Stripe.Event> {
  const stripe = stripeClient();
  if (!stripe) throw new Error("Stripe is not configured");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  if (!signature) throw new Error("Missing Stripe signature");
  return stripe.webhooks.constructEvent(body, signature, secret);
}

export async function processStripeEvent(event: Stripe.Event) {
  const db = adminDb();
  const eventRef = db.collection("stripeEvents").doc(event.id);
  const existing = await eventRef.get();
  if (existing.exists && existing.data()?.processed) return;

  await eventRef.set(
    {
      stripeEventId: event.id,
      type: event.type,
      processed: false,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const organizationId = session.metadata?.organizationId;
    if (organizationId) {
      await updateOrganizationSubscription({
        organizationId,
        status: "active",
        plan: session.metadata?.plan === "pro" ? "pro" : "pilot",
        stripeCustomerId: typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null,
      });
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const organizationId = subscription.metadata?.organizationId;
    if (organizationId) {
      await updateOrganizationSubscription({
        organizationId,
        status: mapStripeStatus(subscription.status),
        plan: subscription.metadata?.plan === "pro" ? "pro" : "pilot",
        stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
        stripeSubscriptionId: subscription.id,
        subscriptionCurrentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      });
    }
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId =
      typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
    if (subscriptionId) {
      const orgSnap = await db.collection("organizations").where("stripeSubscriptionId", "==", subscriptionId).limit(1).get();
      if (!orgSnap.empty) {
        await orgSnap.docs[0]!.ref.set(
          {
            status: event.type === "invoice.paid" ? "active" : "past_due",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
    }
  }

  await eventRef.set({ processed: true, updatedAt: serverTimestamp() }, { merge: true });
}
