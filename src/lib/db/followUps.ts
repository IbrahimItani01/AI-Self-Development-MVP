import { adminDb, fromDoc, serverTimestamp } from "@/lib/firebase/admin";
import type { FollowUpFlag, FollowUpSeverity, FollowUpSource, FollowUpStatus } from "@/types";

export async function createFollowUpFlag(input: {
  organizationId: string;
  studentId: string;
  source: FollowUpSource;
  severity: FollowUpSeverity;
  title: string;
  summary: string;
  recommendedAction: string;
}) {
  await adminDb().collection("followUpFlags").add({
    ...input,
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listFollowUpFlags(organizationId: string, status?: FollowUpStatus): Promise<FollowUpFlag[]> {
  let query: FirebaseFirestore.Query = adminDb()
    .collection("followUpFlags")
    .where("organizationId", "==", organizationId);
  if (status) query = query.where("status", "==", status);
  const snap = await query.orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => fromDoc<FollowUpFlag>(doc));
}

export async function updateFollowUpStatus(flagId: string, organizationId: string, status: FollowUpStatus) {
  const ref = adminDb().collection("followUpFlags").doc(flagId);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.organizationId !== organizationId) {
    throw new Error("Follow-up flag not found");
  }
  await ref.update({ status, updatedAt: serverTimestamp() });
}

export async function listStudentFollowUps(organizationId: string, studentId: string): Promise<FollowUpFlag[]> {
  const snap = await adminDb()
    .collection("followUpFlags")
    .where("organizationId", "==", organizationId)
    .where("studentId", "==", studentId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => fromDoc<FollowUpFlag>(doc));
}
