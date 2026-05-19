import { adminDb, fromDoc } from "@/lib/firebase/admin";
import type { SubscriptionPlan } from "@/types";

export async function listActiveSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const snap = await adminDb()
    .collection("subscriptionPlans")
    .where("active", "==", true)
    .orderBy("sortOrder", "asc")
    .get();
  return snap.docs.map((doc) => fromDoc<SubscriptionPlan>(doc));
}

export async function getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
  const doc = await adminDb().collection("subscriptionPlans").doc(planId).get();
  if (!doc.exists || doc.data()?.active !== true) return null;
  return fromDoc<SubscriptionPlan>(doc);
}
