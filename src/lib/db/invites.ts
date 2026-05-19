import { adminDb, cleanUndefined, fromDoc, serverTimestamp, toFirestoreDate } from "@/lib/firebase/admin";
import { normalizeInviteCode } from "@/lib/utils/ids";
import type { InviteCode } from "@/types";

export async function listInviteCodes(organizationId: string): Promise<InviteCode[]> {
  const snap = await adminDb()
    .collection("inviteCodes")
    .where("organizationId", "==", organizationId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => fromDoc<InviteCode>(doc));
}

export async function createInviteCode(input: {
  organizationId: string;
  code: string;
  label: string;
  maxUses: number | null;
  expiresAt?: Date | null;
}): Promise<string> {
  const code = normalizeInviteCode(input.code);
  const docRef = adminDb().collection("inviteCodes").doc(code);
  await docRef.set({
    organizationId: input.organizationId,
    code,
    label: input.label,
    maxUses: input.maxUses,
    usedCount: 0,
    active: true,
    expiresAt: toFirestoreDate(input.expiresAt ?? null),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateInviteCode(
  inviteId: string,
  organizationId: string,
  input: Partial<Pick<InviteCode, "label" | "maxUses" | "active">> & { expiresAt?: Date | null },
) {
  await adminDb()
    .collection("inviteCodes")
    .doc(inviteId)
    .set(
      cleanUndefined({
        label: input.label,
        maxUses: input.maxUses,
        active: input.active,
        expiresAt: input.expiresAt === undefined ? undefined : toFirestoreDate(input.expiresAt),
        organizationId,
        updatedAt: serverTimestamp(),
      }),
      { merge: true },
    );
}

export async function validateAndConsumeInvite(codeInput: string): Promise<InviteCode | null> {
  const code = normalizeInviteCode(codeInput);
  const db = adminDb();
  return db.runTransaction(async (transaction) => {
    const query = db.collection("inviteCodes").where("code", "==", code).limit(1);
    const snap = await transaction.get(query);
    if (snap.empty) return null;

    const ref = snap.docs[0]!.ref;
    const invite = fromDoc<InviteCode>(snap.docs[0]!);
    const expired = invite.expiresAt ? invite.expiresAt.getTime() < Date.now() : false;
    const exhausted = invite.maxUses !== null && invite.usedCount >= invite.maxUses;
    if (!invite.active || expired || exhausted) return null;

    transaction.update(ref, {
      usedCount: invite.usedCount + 1,
      updatedAt: serverTimestamp(),
    });
    return invite;
  });
}
