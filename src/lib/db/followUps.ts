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
  const db = adminDb();
  await db.collection("followUpFlags").add({
    ...input,
    status: "open",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await db.collection("students").doc(input.studentId).set(
    {
      status: "flagged",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listFollowUpFlags(organizationId: string, status?: FollowUpStatus): Promise<FollowUpFlag[]> {
  let query: FirebaseFirestore.Query = adminDb()
    .collection("followUpFlags")
    .where("organizationId", "==", organizationId);
  if (status) query = query.where("status", "==", status);
  const snap = await query.orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => fromDoc<FollowUpFlag>(doc));
}

export async function updateFollowUpStatus(
  flagId: string,
  organizationId: string,
  status: FollowUpStatus,
): Promise<{ studentId: string | null }> {
  const db = adminDb();
  const ref = db.collection("followUpFlags").doc(flagId);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.organizationId !== organizationId) {
    throw new Error("Follow-up flag not found");
  }
  const studentId = doc.data()?.studentId;
  await ref.update({ status, updatedAt: serverTimestamp() });
  if (typeof studentId !== "string") return { studentId: null };
  const studentRef = db.collection("students").doc(studentId);
  if (status === "open") {
    const studentDoc = await studentRef.get();
    if (studentDoc.exists && studentDoc.data()?.organizationId === organizationId) {
      await studentRef.set(
        {
          status: "flagged",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    }
    return { studentId };
  }

  const openFlags = await db
    .collection("followUpFlags")
    .where("organizationId", "==", organizationId)
    .where("studentId", "==", studentId)
    .where("status", "==", "open")
    .limit(1)
    .get();
  if (!openFlags.empty) return { studentId };

  const studentDoc = await studentRef.get();
  if (studentDoc.exists && studentDoc.data()?.organizationId === organizationId && studentDoc.data()?.status === "flagged") {
    await studentRef.set(
      {
        status: "active",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }
  return { studentId };
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
