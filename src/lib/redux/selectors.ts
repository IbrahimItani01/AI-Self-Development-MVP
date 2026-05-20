"use client";

import { startOfMonth } from "date-fns";
import type { RootState } from "@/lib/redux/store";
import type { DashboardOverview, FollowUpStatus, SubscriptionPlanId } from "@/types";

export function selectDashboardState(state: RootState) {
  return state.dashboard;
}

export function selectStudentNames(state: RootState): Map<string, string> {
  return new Map(state.dashboard.students.map((student) => [student.id, student.displayName]));
}

export function selectOpenFollowUpStudentIds(state: RootState): Set<string> {
  return new Set(state.dashboard.followUpFlags.filter((flag) => flag.status === "open").map((flag) => flag.studentId));
}

export function selectSubscriptionPlan(state: RootState, planId?: string | null) {
  return state.dashboard.subscriptionPlans.find((plan) => plan.id === (planId || "pro")) ?? null;
}

export function selectOverview(state: RootState): DashboardOverview | null {
  const organization = state.dashboard.organization;
  if (!organization) return null;

  const monthStart = startOfMonth(new Date()).getTime();
  const monthlyUsage = state.dashboard.usageLogs.filter((log) => (log.createdAt?.getTime() ?? 0) >= monthStart);

  return {
    organization,
    totalStudents: state.dashboard.students.length,
    activeStudents: state.dashboard.students.filter((student) => student.status === "active").length,
    inactiveStudents: state.dashboard.students.filter((student) => student.status === "inactive").length,
    openFollowUps: state.dashboard.followUpFlags.filter((flag) => flag.status === "open").length,
    weeklyCheckIns: state.dashboard.checkIns.filter((checkIn) => (checkIn.createdAt?.getTime() ?? 0) >= monthStart).length,
    monthlyTokens: monthlyUsage.reduce((sum, log) => sum + log.inputTokens + log.outputTokens, 0),
    monthlyEstimatedCost: monthlyUsage.reduce((sum, log) => sum + log.estimatedCost, 0),
  };
}

export function selectPlanByOrganization(state: RootState) {
  const planId = state.dashboard.organization?.plan as SubscriptionPlanId | undefined;
  return selectSubscriptionPlan(state, planId);
}

export function statusRank(status: FollowUpStatus): number {
  return { open: 0, reviewed: 1, closed: 2 }[status];
}
