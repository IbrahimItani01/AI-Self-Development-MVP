"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createInviteCode, updateInviteCode } from "@/lib/db/invites";

export async function createInviteFromDashboard(formData: FormData) {
  const { organization } = await requireAdmin();
  const label = String(formData.get("label") || "Student invite");
  const maxUsesValue = String(formData.get("maxUses") || "");
  const expiresAtValue = String(formData.get("expiresAt") || "");
  await createInviteCode({
    organizationId: organization.id,
    organizationName: organization.name || organization.slug,
    label,
    maxUses: maxUsesValue ? Number(maxUsesValue) : null,
    expiresAt: expiresAtValue ? new Date(expiresAtValue) : null,
  });
  revalidatePath("/dashboard/invites");
}

export async function setInviteActiveFromDashboard(formData: FormData) {
  const { organization } = await requireAdmin();
  await updateInviteCode(String(formData.get("inviteId")), organization.id, {
    active: String(formData.get("active")) === "true",
  });
  revalidatePath("/dashboard/invites");
}
