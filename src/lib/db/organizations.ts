import { adminDb, cleanUndefined, fromDoc, serverTimestamp, toFirestoreDate } from "@/lib/firebase/admin";
import { monthStart } from "@/lib/utils/dates";
import type { DashboardOverview, Organization, OrganizationAdmin, OrganizationPlan, OrganizationStatus, SubscriptionPlan } from "@/types";

export async function getOrganization(organizationId: string): Promise<Organization | null> {
  const doc = await adminDb().collection("organizations").doc(organizationId).get();
  return doc.exists ? fromDoc<Organization>(doc) : null;
}

export async function getAdminByFirebaseUid(firebaseUid: string): Promise<OrganizationAdmin | null> {
  const snap = await adminDb()
    .collection("organizationAdmins")
    .where("firebaseUid", "==", firebaseUid)
    .limit(1)
    .get();
  return snap.empty ? null : fromDoc<OrganizationAdmin>(snap.docs[0]!);
}

export async function getAdminByEmail(email: string): Promise<OrganizationAdmin | null> {
  const snap = await adminDb().collection("organizationAdmins").where("email", "==", email.toLowerCase()).limit(1).get();
  return snap.empty ? null : fromDoc<OrganizationAdmin>(snap.docs[0]!);
}

export async function createRegisteredOrganization(input: {
  firebaseUid: string;
  adminName: string;
  adminEmail: string;
  organizationName: string;
  slug: string;
  phone?: string | null;
  website?: string | null;
  address?: Organization["address"];
  stripeCustomerId?: string | null;
  plan: SubscriptionPlan;
}): Promise<Organization> {
  const db = adminDb();
  const organizationRef = db.collection("organizations").doc(input.slug);
  const existingAdmin = await getAdminByFirebaseUid(input.firebaseUid);
  if (existingAdmin) {
    const existingOrganization = await getOrganization(existingAdmin.organizationId);
    if (existingOrganization) return existingOrganization;
  }

  await organizationRef.set({
    name: input.organizationName,
    slug: input.slug,
    status: "inactive",
    plan: "pro",
    maxStudents: input.plan.studentLimit,
    monthlyTokenLimit: input.plan.monthlyTokenLimit,
    billingEmail: input.adminEmail.toLowerCase(),
    billingContactName: input.adminName,
    phone: input.phone ?? null,
    website: input.website ?? null,
    address: input.address ?? null,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: null,
    subscriptionCurrentPeriodEnd: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await db.collection("organizationAdmins").doc(input.firebaseUid).set({
    organizationId: organizationRef.id,
    firebaseUid: input.firebaseUid,
    name: input.adminName,
    email: input.adminEmail.toLowerCase(),
    role: "owner",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return fromDoc<Organization>(await organizationRef.get());
}

export async function getDashboardOverview(organizationId: string): Promise<DashboardOverview> {
  const organization = await getOrganization(organizationId);
  if (!organization) throw new Error("Organization not found");

  const db = adminDb();
  const [studentsSnap, activeStudentsSnap, inactiveStudentsSnap, flagsSnap, checkInsSnap, usageSnap] = await Promise.all([
    db.collection("students").where("organizationId", "==", organizationId).count().get(),
    db.collection("students").where("organizationId", "==", organizationId).where("status", "==", "active").count().get(),
    db.collection("students").where("organizationId", "==", organizationId).where("status", "==", "inactive").count().get(),
    db.collection("followUpFlags").where("organizationId", "==", organizationId).where("status", "==", "open").count().get(),
    db.collection("checkIns").where("organizationId", "==", organizationId).where("createdAt", ">=", monthStart()).count().get(),
    db.collection("usageLogs").where("organizationId", "==", organizationId).where("createdAt", ">=", monthStart()).get(),
  ]);

  const usage = usageSnap.docs.map((doc) => doc.data());
  return {
    organization,
    totalStudents: studentsSnap.data().count,
    activeStudents: activeStudentsSnap.data().count,
    inactiveStudents: inactiveStudentsSnap.data().count,
    openFollowUps: flagsSnap.data().count,
    weeklyCheckIns: checkInsSnap.data().count,
    monthlyTokens: usage.reduce((sum, item) => sum + Number(item.inputTokens ?? 0) + Number(item.outputTokens ?? 0), 0),
    monthlyEstimatedCost: usage.reduce((sum, item) => sum + Number(item.estimatedCost ?? 0), 0),
  };
}

export async function updateOrganizationSubscription(input: {
  organizationId: string;
  status: OrganizationStatus;
  plan?: OrganizationPlan;
  maxStudents?: number;
  monthlyTokenLimit?: number;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionCurrentPeriodEnd?: Date | null;
}) {
  await adminDb()
    .collection("organizations")
    .doc(input.organizationId)
    .set(
      cleanUndefined({
        status: input.status,
        plan: input.plan,
        maxStudents: input.maxStudents,
        monthlyTokenLimit: input.monthlyTokenLimit,
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId,
        subscriptionCurrentPeriodEnd: toFirestoreDate(input.subscriptionCurrentPeriodEnd),
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    );
}
