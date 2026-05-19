import { NextResponse } from "next/server";
import { z } from "zod";
import { adminAuth } from "@/lib/firebase/admin";
import { getSubscriptionPlan } from "@/lib/db/plans";
import { createRegisteredOrganization, getAdminByFirebaseUid, getOrganization } from "@/lib/db/organizations";
import { createStripeCustomerForOrganization } from "@/lib/stripe/server";
import { randomCode, slugify } from "@/lib/utils/ids";

const schema = z.object({
  idToken: z.string().min(10),
  adminName: z.string().trim().min(2),
  organizationName: z.string().trim().min(2),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const decoded = await adminAuth().verifyIdToken(input.idToken);
    const email = decoded.email;
    if (!email) return NextResponse.json({ error: "Firebase account must have an email address." }, { status: 400 });

    const plan = await getSubscriptionPlan("pro");
    if (!plan) return NextResponse.json({ error: "No active Pro plan is configured." }, { status: 400 });

    const existingAdmin = await getAdminByFirebaseUid(decoded.uid);
    if (existingAdmin) {
      const existingOrganization = await getOrganization(existingAdmin.organizationId);
      return NextResponse.json({ organizationId: existingAdmin.organizationId, stripeCustomerId: existingOrganization?.stripeCustomerId ?? null });
    }

    const baseSlug = slugify(input.organizationName) || "school";
    const organizationId = `${baseSlug}-${randomCode("").toLowerCase()}`;
    const stripeCustomerId = await createStripeCustomerForOrganization({
      organizationName: input.organizationName,
      adminEmail: email,
      adminName: input.adminName,
      organizationId,
    });

    const organization = await createRegisteredOrganization({
      firebaseUid: decoded.uid,
      adminName: input.adminName,
      adminEmail: email,
      organizationName: input.organizationName,
      slug: organizationId,
      phone: input.phone || null,
      website: input.website || null,
      address: {
        line1: input.addressLine1 || null,
        city: input.city || null,
        country: input.country || null,
      },
      stripeCustomerId,
      plan,
    });

    return NextResponse.json({ organizationId: organization.id, stripeCustomerId: organization.stripeCustomerId ?? null });
  } catch (error) {
    console.error("Organization registration failed", error);
    return NextResponse.json({ error: "Unable to register organization." }, { status: 400 });
  }
}
