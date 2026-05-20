"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { updateFollowUpStatus } from "@/lib/db/followUps";
import type { FollowUpStatus } from "@/types";

export async function updateFollowUpStatusFromDashboard(formData: FormData) {
  const { organization } = await requireAdmin();
  const result = await updateFollowUpStatus(String(formData.get("flagId")), organization.id, String(formData.get("status")) as FollowUpStatus);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/students");
  if (result.studentId) revalidatePath(`/dashboard/students/${result.studentId}`);
}
