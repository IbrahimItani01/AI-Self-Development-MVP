"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { deleteOrganizationAccount } from "@/lib/db/organizations";
import { cancelStripeSubscriptionNow, deleteStripeCustomerNow } from "@/lib/stripe/server";

const deleteOrganizationSchema = z.object({
  confirmation: z.string().min(1),
});

export interface DeleteOrganizationState {
  error: string | null;
}

export async function deleteOrganizationFromDashboard(
  _previousState: DeleteOrganizationState,
  formData: FormData,
): Promise<DeleteOrganizationState> {
  const { admin, organization } = await requireAdmin();
  const parsed = deleteOrganizationSchema.safeParse({
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success) return { error: "Type the organization name to confirm deletion." };

  if (parsed.data.confirmation !== organization.name) {
    return { error: "Organization name confirmation did not match." };
  }

  try {
    if (organization.stripeSubscriptionId) {
      await cancelStripeSubscriptionNow(organization.stripeSubscriptionId);
    }
    if (organization.stripeCustomerId) {
      await deleteStripeCustomerNow(organization.stripeCustomerId);
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to clean up the linked Stripe account.",
    };
  }

  await deleteOrganizationAccount({
    organizationId: organization.id,
    requestedByFirebaseUid: admin.firebaseUid,
  });

  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/login?accountDeleted=1");
}
