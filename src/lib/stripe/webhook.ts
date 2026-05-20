import Stripe from "stripe";
import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import { updateOrganizationSubscription } from "@/lib/db/organizations";
import { getSubscriptionPlan } from "@/lib/db/plans";
import { mapStripeStatus, stripeClient } from "./server";
import {
	SubscriptionItemWithPeriod,
	SubscriptionWithLegacyPeriod,
} from "@/types";

export async function constructStripeEvent(
	body: string,
	signature: string | null,
): Promise<Stripe.Event> {
	const stripe = stripeClient();
	if (!stripe) throw new Error("Stripe is not configured");
	const secret = process.env.STRIPE_WEBHOOK_SECRET;
	if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
	if (!signature) throw new Error("Missing Stripe signature");
	return stripe.webhooks.constructEvent(body, signature, secret);
}

function subscriptionCurrentPeriodEnd(
	subscription: Stripe.Subscription,
): Date | null {
	const itemPeriodEnd = (
		subscription.items.data[0] as SubscriptionItemWithPeriod | undefined
	)?.current_period_end;
	const legacyPeriodEnd = (subscription as SubscriptionWithLegacyPeriod)
		.current_period_end;
	const periodEnd = itemPeriodEnd ?? legacyPeriodEnd;
	return periodEnd ? new Date(periodEnd * 1000) : null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | undefined {
	const currentSubscription = invoice.parent?.subscription_details?.subscription;
	if (typeof currentSubscription === "string") return currentSubscription;
	if (currentSubscription?.id) return currentSubscription.id;

	const legacySubscription = (invoice as unknown as { subscription?: string | Stripe.Subscription }).subscription;
	return typeof legacySubscription === "string"
		? legacySubscription
		: legacySubscription?.id;
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
		const plan = await getSubscriptionPlan(session.metadata?.plan || "pro");
		if (organizationId) {
			await updateOrganizationSubscription({
				organizationId,
				status: "active",
				plan: "pro",
				maxStudents: plan?.studentLimit,
				monthlyTokenLimit: plan?.monthlyTokenLimit,
				stripeCustomerId:
					typeof session.customer === "string"
						? session.customer
						: (session.customer?.id ?? null),
				stripeSubscriptionId:
					typeof session.subscription === "string"
						? session.subscription
						: (session.subscription?.id ?? null),
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
		const plan = await getSubscriptionPlan(
			subscription.metadata?.plan || "pro",
		);
		const status = mapStripeStatus(subscription.status);
		if (organizationId) {
			await updateOrganizationSubscription({
				organizationId,
				status: status === "inactive" ? undefined : status,
				plan: "pro",
				maxStudents: plan?.studentLimit,
				monthlyTokenLimit: plan?.monthlyTokenLimit,
				stripeCustomerId:
					typeof subscription.customer === "string"
						? subscription.customer
						: subscription.customer.id,
				stripeSubscriptionId: subscription.id,
				subscriptionCurrentPeriodEnd:
					subscriptionCurrentPeriodEnd(subscription),
			});
		}
	}

	if (
		event.type === "invoice.paid" ||
		event.type === "invoice.payment_failed"
	) {
		const invoice = event.data.object as Stripe.Invoice;
		const subscriptionId = invoiceSubscriptionId(invoice);
		if (subscriptionId) {
			const orgSnap = await db
				.collection("organizations")
				.where("stripeSubscriptionId", "==", subscriptionId)
				.limit(1)
				.get();
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

	await eventRef.set(
		{ processed: true, updatedAt: serverTimestamp() },
		{ merge: true },
	);
}
