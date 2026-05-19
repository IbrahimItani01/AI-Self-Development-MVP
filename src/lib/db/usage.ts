import { adminDb, serverTimestamp } from "@/lib/firebase/admin";
import type { UsageLog, UsageType } from "@/types";

export async function createUsageLog(input: {
  organizationId: string;
  studentId?: string | null;
  type: UsageType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}) {
  await adminDb().collection("usageLogs").add({
    ...input,
    studentId: input.studentId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function listRecentUsage(organizationId: string, limit = 50): Promise<UsageLog[]> {
  const snap = await adminDb()
    .collection("usageLogs")
    .where("organizationId", "==", organizationId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as UsageLog);
}
