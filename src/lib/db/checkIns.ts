import { adminDb, fromDoc, serverTimestamp, toFirestoreDate } from "@/lib/firebase/admin";
import type { CheckIn, CheckInAnswers } from "@/types";

export async function createCheckIn(input: {
  organizationId: string;
  studentId: string;
  weekStart: Date;
  answers: CheckInAnswers;
  aiSummary: string;
  suggestedNextStep: string;
  followUpRecommended: boolean;
  followUpReason?: string | null;
}) {
  await adminDb().collection("checkIns").add({
    ...input,
    weekStart: toFirestoreDate(input.weekStart),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await adminDb()
    .collection("students")
    .doc(input.studentId)
    .set(
      {
        lastCheckInAt: serverTimestamp(),
        lastCheckInWeekStart: toFirestoreDate(input.weekStart),
        lastInteractionAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
}

export async function listRecentCheckIns(organizationId: string, limit = 50): Promise<CheckIn[]> {
  const snap = await adminDb()
    .collection("checkIns")
    .where("organizationId", "==", organizationId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => fromDoc<CheckIn>(doc));
}

export async function listStudentCheckIns(organizationId: string, studentId: string, limit = 10): Promise<CheckIn[]> {
  const snap = await adminDb()
    .collection("checkIns")
    .where("organizationId", "==", organizationId)
    .where("studentId", "==", studentId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => fromDoc<CheckIn>(doc));
}

export async function getLatestStudentCheckIn(organizationId: string, studentId: string): Promise<CheckIn | null> {
  const snap = await adminDb()
    .collection("checkIns")
    .where("organizationId", "==", organizationId)
    .where("studentId", "==", studentId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  return snap.empty ? null : fromDoc<CheckIn>(snap.docs[0]!);
}
