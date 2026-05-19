import type { SubscriptionPlan } from "@/types";

const PLAN_LABELS: Record<string, string> = {
  pro: "PRO",
};

export function formatPlanName(planId: string): string {
  return PLAN_LABELS[planId] ?? planId;
}

export function subscriptionPlanDisplayName(plan: Pick<SubscriptionPlan, "name"> | null | undefined, planId: string): string {
  return plan?.name || formatPlanName(planId);
}
