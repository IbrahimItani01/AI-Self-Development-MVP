import { adminDb, cleanUndefined, fromDoc, serverTimestamp } from "@/lib/firebase/admin";
import type {
  Conversation,
  GrowthPlan,
  Message,
  OnboardingStatus,
  Organization,
  Student,
  StudentOnboarding,
  TelegramUser,
} from "@/types";
import { getOrganization } from "./organizations";

export interface StudentDetail {
  student: Student;
  growthPlan: GrowthPlan | null;
  conversation: Conversation | null;
  recentMessages: Message[];
}

export interface BotSession {
  id: string;
  studentId?: string | null;
  organizationId?: string | null;
  telegramUserId: string;
  telegramChatId: string;
  flow: "invite" | "onboarding" | "check_in" | "reset_confirm";
  step: string;
  data: Record<string, unknown>;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export async function findStudentByTelegramUserId(telegramUserId: string): Promise<Student | null> {
  const snap = await adminDb().collection("students").where("telegramUserId", "==", telegramUserId).limit(1).get();
  return snap.empty ? null : fromDoc<Student>(snap.docs[0]!);
}

export async function getStudent(organizationId: string, studentId: string): Promise<Student | null> {
  const doc = await adminDb().collection("students").doc(studentId).get();
  if (!doc.exists || doc.data()?.organizationId !== organizationId) return null;
  return fromDoc<Student>(doc);
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const doc = await adminDb().collection("students").doc(studentId).get();
  return doc.exists ? fromDoc<Student>(doc) : null;
}

export async function createOrLinkStudent(input: {
  organizationId: string;
  telegramUser: TelegramUser;
  chatId: string;
}): Promise<Student> {
  const existing = await findStudentByTelegramUserId(String(input.telegramUser.id));
  if (existing) return existing;

  const ref = adminDb().collection("students").doc();
  const displayName =
    [input.telegramUser.first_name, input.telegramUser.last_name].filter(Boolean).join(" ") ||
    input.telegramUser.username ||
    "Student";
  await ref.set({
    organizationId: input.organizationId,
    telegramUserId: String(input.telegramUser.id),
    telegramUsername: input.telegramUser.username ?? null,
    firstName: input.telegramUser.first_name ?? null,
    lastName: input.telegramUser.last_name ?? null,
    displayName,
    gradeLevel: null,
    cohort: null,
    onboardingStatus: "in_progress",
    selectedFocusArea: null,
    mainGoal: null,
    status: "active",
    lastInteractionAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const doc = await ref.get();
  await setBotSession({
    telegramUserId: String(input.telegramUser.id),
    telegramChatId: input.chatId,
    studentId: ref.id,
    organizationId: input.organizationId,
    flow: "onboarding",
    step: "preferredName",
    data: {},
  });
  return fromDoc<Student>(doc);
}

export async function updateStudentProfile(
  studentId: string,
  input: Partial<Pick<Student, "displayName" | "gradeLevel" | "cohort" | "selectedFocusArea" | "mainGoal" | "status">> & {
    onboardingStatus?: OnboardingStatus;
  },
) {
  await adminDb()
    .collection("students")
    .doc(studentId)
    .set({ ...cleanUndefined(input), updatedAt: serverTimestamp(), lastInteractionAt: serverTimestamp() }, { merge: true });
}

export async function touchStudent(studentId: string) {
  await adminDb().collection("students").doc(studentId).set({ lastInteractionAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
}

export async function upsertOnboarding(input: {
  studentId: string;
  organizationId: string;
  answers: Record<string, unknown>;
  completed?: boolean;
}) {
  await adminDb()
    .collection("studentOnboarding")
    .doc(input.studentId)
    .set(
      {
        studentId: input.studentId,
        organizationId: input.organizationId,
        answers: input.answers,
        completedAt: input.completed ? serverTimestamp() : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
}

export async function getOnboarding(studentId: string): Promise<StudentOnboarding | null> {
  const doc = await adminDb().collection("studentOnboarding").doc(studentId).get();
  return doc.exists ? fromDoc<StudentOnboarding>(doc) : null;
}

export async function saveGrowthPlan(input: Omit<GrowthPlan, "id" | "createdAt" | "updatedAt">): Promise<void> {
  await adminDb()
    .collection("growthPlans")
    .doc(input.studentId)
    .set({ ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
}

export async function getStudentGrowthPlan(organizationId: string, studentId: string): Promise<GrowthPlan | null> {
  const doc = await adminDb().collection("growthPlans").doc(studentId).get();
  if (!doc.exists || doc.data()?.organizationId !== organizationId) return null;
  return fromDoc<GrowthPlan>(doc);
}

export async function getOrCreateConversation(student: Student, telegramChatId: string): Promise<Conversation> {
  const db = adminDb();
  const snap = await db.collection("conversations").where("studentId", "==", student.id).limit(1).get();
  if (!snap.empty) return fromDoc<Conversation>(snap.docs[0]!);

  const ref = db.collection("conversations").doc();
  await ref.set({
    studentId: student.id,
    organizationId: student.organizationId,
    telegramChatId,
    title: `${student.displayName} reflection`,
    lastMessageAt: serverTimestamp(),
    runningSummary: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return fromDoc<Conversation>(await ref.get());
}

export async function addMessage(input: {
  conversationId: string;
  studentId: string;
  organizationId: string;
  role: "student" | "assistant" | "system";
  content: string;
}) {
  const db = adminDb();
  await db.collection("messages").add({
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await db.collection("conversations").doc(input.conversationId).set(
    {
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateConversationSummary(conversationId: string, runningSummary: string) {
  await adminDb().collection("conversations").doc(conversationId).set(
    {
      runningSummary,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listRecentMessages(conversationId: string, limit = 8): Promise<Message[]> {
  const snap = await adminDb()
    .collection("messages")
    .where("conversationId", "==", conversationId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((doc) => fromDoc<Message>(doc)).reverse();
}

export async function listStudents(organizationId: string): Promise<Student[]> {
  const snap = await adminDb()
    .collection("students")
    .where("organizationId", "==", organizationId)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((doc) => fromDoc<Student>(doc));
}

export async function getStudentDetail(organizationId: string, studentId: string): Promise<StudentDetail | null> {
  const student = await getStudent(organizationId, studentId);
  if (!student) return null;
  const conversationSnap = await adminDb().collection("conversations").where("studentId", "==", studentId).limit(1).get();
  const conversation = conversationSnap.empty ? null : fromDoc<Conversation>(conversationSnap.docs[0]!);
  const [growthPlan, recentMessages] = await Promise.all([
    getStudentGrowthPlan(organizationId, studentId),
    conversation ? listRecentMessages(conversation.id, 12) : Promise.resolve([]),
  ]);
  return { student, growthPlan, conversation, recentMessages };
}

export async function canStudentUseBot(studentId: string): Promise<{ allowed: boolean; reason?: string; organization?: Organization }> {
  const doc = await adminDb().collection("students").doc(studentId).get();
  if (!doc.exists) return { allowed: false, reason: "Student not found" };
  const student = fromDoc<Student>(doc);
  const organization = await getOrganization(student.organizationId);
  if (!organization) return { allowed: false, reason: "School account not found" };
  if (!["active", "trial"].includes(organization.status)) {
    return { allowed: false, reason: "Your school account is currently inactive. Please contact your school coordinator.", organization };
  }
  return { allowed: true, organization };
}

export async function setBotSession(input: {
  telegramUserId: string;
  telegramChatId: string;
  studentId?: string | null;
  organizationId?: string | null;
  flow: BotSession["flow"];
  step: string;
  data: Record<string, unknown>;
}) {
  await adminDb()
    .collection("botSessions")
    .doc(input.telegramUserId)
    .set({ ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
}

export async function getBotSession(telegramUserId: string): Promise<BotSession | null> {
  const doc = await adminDb().collection("botSessions").doc(telegramUserId).get();
  return doc.exists ? fromDoc<BotSession>(doc) : null;
}

export async function clearBotSession(telegramUserId: string) {
  await adminDb().collection("botSessions").doc(telegramUserId).delete();
}
