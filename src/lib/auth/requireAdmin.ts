import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { getAdminByFirebaseUid, getOrganization } from "@/lib/db/organizations";
import type { AdminContext } from "@/types";

export async function getAdminContext(): Promise<AdminContext | null> {
  if (!isFirebaseAdminConfigured()) return null;
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(session, true);
    const admin = await getAdminByFirebaseUid(decoded.uid);
    if (!admin) return null;
    const organization = await getOrganization(admin.organizationId);
    if (!organization) return null;
    return { admin, organization };
  } catch (error) {
    console.error("Failed to verify admin session", error);
    return null;
  }
}

export async function requireAdmin(): Promise<AdminContext> {
  const context = await getAdminContext();
  if (!context) redirect("/login");
  return context;
}
