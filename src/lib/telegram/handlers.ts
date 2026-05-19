import {
  addMessage,
  canStudentUseBot,
  clearBotSession,
  createOrLinkStudent,
  findStudentByTelegramUserId,
  getBotSession,
  getOrCreateConversation,
  getStudentById,
  getStudentGrowthPlan,
  listRecentMessages,
  saveGrowthPlan,
  setBotSession,
  touchStudent,
  updateConversationSummary,
  updateStudentProfile,
  upsertOnboarding,
} from "@/lib/db/students";
import { validateAndConsumeInvite } from "@/lib/db/invites";
import { createCheckIn } from "@/lib/db/checkIns";
import { createFollowUpFlag } from "@/lib/db/followUps";
import {
  classifyFollowUpNeed,
  generateChatReply,
  generateCheckInSummary,
  generateGrowthPlan,
  summarizeConversation,
} from "@/lib/ai";
import { currentWeekStart } from "@/lib/utils/dates";
import type { CheckInAnswers, Student, TelegramUpdate, TelegramUser } from "@/types";
import { answerCallbackQuery, sendTelegramMessage } from "./bot";
import { focusAreaButtons, HELP_MESSAGE, INACTIVE_ORG_MESSAGE, onboardingQuestion } from "./messages";

const checkInSteps: Array<keyof CheckInAnswers> = ["progress", "difficulty", "insight", "nextStep"];
const checkInPrompts: Record<keyof CheckInAnswers, string> = {
  progress: "What progress did you make this week?",
  difficulty: "What felt difficult?",
  insight: "What did you learn about yourself?",
  nextStep: "What is one small step for next week?",
};

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    await handleCallback(update.callback_query.from, String(update.callback_query.message?.chat.id ?? ""), update.callback_query.id, update.callback_query.data);
    return;
  }

  const message = update.message;
  if (!message?.from || !message.text) return;
  const chatId = String(message.chat.id);
  const text = message.text.trim();
  const telegramUserId = String(message.from.id);

  if (text.startsWith("/start")) {
    const payload = text.split(" ").slice(1).join(" ").trim();
    await handleStart(message.from, chatId, payload);
    return;
  }

  if (text === "/help") {
    await sendTelegramMessage({ chatId, text: HELP_MESSAGE });
    return;
  }

  const student = await findStudentByTelegramUserId(telegramUserId);
  if (!student) {
    await processInviteCode(message.from, chatId, text);
    return;
  }

  if (text === "/reset") {
    await setBotSession({
      telegramUserId,
      telegramChatId: chatId,
      studentId: student.id,
      organizationId: student.organizationId,
      flow: "reset_confirm",
      step: "confirm",
      data: {},
    });
    await sendTelegramMessage({
      chatId,
      text: "Reset your demo onboarding and start again?",
      replyMarkup: { inline_keyboard: [[{ text: "Reset", callback_data: "reset:yes" }, { text: "Cancel", callback_data: "reset:no" }]] },
    });
    return;
  }

  const access = await canStudentUseBot(student.id);
  if (!access.allowed) {
    await sendTelegramMessage({ chatId, text: access.reason || INACTIVE_ORG_MESSAGE });
    return;
  }

  if (text === "/checkin") {
    await startCheckIn(student, chatId);
    return;
  }

  if (text === "/plan") {
    await showPlan(student, chatId);
    return;
  }

  const session = await getBotSession(telegramUserId);
  if (session?.flow === "onboarding") {
    await continueOnboarding(student, chatId, text);
    return;
  }
  if (session?.flow === "check_in") {
    await continueCheckIn(student, chatId, text);
    return;
  }

  if (student.onboardingStatus !== "completed") {
    await setBotSession({
      telegramUserId,
      telegramChatId: chatId,
      studentId: student.id,
      organizationId: student.organizationId,
      flow: "onboarding",
      step: "preferredName",
      data: {},
    });
    await sendTelegramMessage({ chatId, text: onboardingQuestion("preferredName") });
    return;
  }

  await handleStudentChat(student, chatId, text);
}

async function handleStart(user: TelegramUser, chatId: string, payload?: string) {
  const existing = await findStudentByTelegramUserId(String(user.id));
  if (existing) {
    const access = await canStudentUseBot(existing.id);
    if (!access.allowed) {
      await sendTelegramMessage({ chatId, text: access.reason || INACTIVE_ORG_MESSAGE });
      return;
    }
    await sendTelegramMessage({ chatId, text: `Welcome back, ${existing.displayName}. ${HELP_MESSAGE}` });
    return;
  }

  if (payload) {
    await processInviteCode(user, chatId, payload);
    return;
  }

  await setBotSession({
    telegramUserId: String(user.id),
    telegramChatId: chatId,
    flow: "invite",
    step: "code",
    data: {},
  });
  await sendTelegramMessage({ chatId, text: "Welcome. Please enter your school invite code to get started." });
}

async function processInviteCode(user: TelegramUser, chatId: string, text: string) {
  const invite = await validateAndConsumeInvite(text);
  if (!invite) {
    await sendTelegramMessage({ chatId, text: "That invite code was not valid. Please check with your school coordinator and try again." });
    return;
  }

  const student = await createOrLinkStudent({ organizationId: invite.organizationId, telegramUser: user, chatId });
  await sendTelegramMessage({ chatId, text: `You are connected to your school. ${onboardingQuestion("preferredName")}` });
  await touchStudent(student.id);
}

async function handleCallback(user: TelegramUser, chatId: string, callbackId: string, data?: string) {
  await answerCallbackQuery(callbackId);
  if (!data) return;
  const student = await findStudentByTelegramUserId(String(user.id));
  if (!student) return;

  if (data.startsWith("focus:")) {
    const focusArea = data.replace("focus:", "");
    await continueOnboarding(student, chatId, focusArea);
    return;
  }

  if (data === "reset:no") {
    await clearBotSession(String(user.id));
    await sendTelegramMessage({ chatId, text: "Reset canceled." });
    return;
  }

  if (data === "reset:yes") {
    await updateStudentProfile(student.id, {
      onboardingStatus: "in_progress",
      selectedFocusArea: null,
      mainGoal: null,
      status: "active",
    });
    await setBotSession({
      telegramUserId: String(user.id),
      telegramChatId: chatId,
      studentId: student.id,
      organizationId: student.organizationId,
      flow: "onboarding",
      step: "preferredName",
      data: {},
    });
    await sendTelegramMessage({ chatId, text: onboardingQuestion("preferredName") });
  }
}

async function continueOnboarding(student: Student, chatId: string, answer: string) {
  const session = await getBotSession(student.telegramUserId);
  const step = session?.step || "preferredName";
  const data = { ...(session?.data ?? {}), [step]: answer };
  const nextStep = nextOnboardingStep(step);

  if (step === "preferredName") await updateStudentProfile(student.id, { displayName: answer, onboardingStatus: "in_progress" });
  if (step === "gradeLevel") await updateStudentProfile(student.id, { gradeLevel: answer });
  if (step === "focusArea") await updateStudentProfile(student.id, { selectedFocusArea: answer });
  if (step === "mainChallenge") await updateStudentProfile(student.id, { mainGoal: answer });

  await upsertOnboarding({ studentId: student.id, organizationId: student.organizationId, answers: data });

  if (nextStep) {
    await setBotSession({
      telegramUserId: student.telegramUserId,
      telegramChatId: chatId,
      studentId: student.id,
      organizationId: student.organizationId,
      flow: "onboarding",
      step: nextStep,
      data,
    });
    if (nextStep === "focusArea") {
      await sendTelegramMessage({
        chatId,
        text: onboardingQuestion(nextStep),
        replyMarkup: {
          inline_keyboard: focusAreaButtons.map((row) => row.map((label) => ({ text: label, callback_data: `focus:${label}` }))),
        },
      });
    } else {
      await sendTelegramMessage({ chatId, text: onboardingQuestion(nextStep) });
    }
    return;
  }

  await finishOnboarding(student.id, chatId, data);
}

function nextOnboardingStep(step: string): string | null {
  const steps = ["preferredName", "gradeLevel", "focusArea", "mainChallenge", "progressDefinition", "checkInCadence"];
  const index = steps.indexOf(step);
  return index >= 0 && index < steps.length - 1 ? steps[index + 1]! : null;
}

async function finishOnboarding(studentId: string, chatId: string, answers: Record<string, unknown>) {
  const loadedStudent = await getStudentById(studentId);
  if (!loadedStudent) return;

  const plan = await generateGrowthPlan(loadedStudent, answers);
  await saveGrowthPlan(plan);
  await updateStudentProfile(loadedStudent.id, {
    onboardingStatus: "completed",
    selectedFocusArea: plan.focusArea,
    mainGoal: plan.mainGoal,
  });
  await upsertOnboarding({ studentId: loadedStudent.id, organizationId: loadedStudent.organizationId, answers, completed: true });
  await clearBotSession(loadedStudent.telegramUserId);

  await sendTelegramMessage({
    chatId,
    text: `Your starter growth plan is ready.

Focus: ${plan.focusArea}
Goal: ${plan.mainGoal}
Weekly actions:
- ${plan.weeklyActions.join("\n- ")}

Next step: ${plan.suggestedNextStep}`,
  });
}

async function startCheckIn(student: Student, chatId: string) {
  await setBotSession({
    telegramUserId: student.telegramUserId,
    telegramChatId: chatId,
    studentId: student.id,
    organizationId: student.organizationId,
    flow: "check_in",
    step: "progress",
    data: {},
  });
  await sendTelegramMessage({ chatId, text: checkInPrompts.progress });
}

async function continueCheckIn(student: Student, chatId: string, answer: string) {
  const session = await getBotSession(student.telegramUserId);
  const step = (session?.step || "progress") as keyof CheckInAnswers;
  const data = { ...(session?.data ?? {}), [step]: answer };
  const currentIndex = checkInSteps.indexOf(step);
  const nextStep = checkInSteps[currentIndex + 1];

  if (nextStep) {
    await setBotSession({
      telegramUserId: student.telegramUserId,
      telegramChatId: chatId,
      studentId: student.id,
      organizationId: student.organizationId,
      flow: "check_in",
      step: nextStep,
      data,
    });
    await sendTelegramMessage({ chatId, text: checkInPrompts[nextStep] });
    return;
  }

  const answers = data as unknown as CheckInAnswers;
  const { summary, suggestedNextStep } = await generateCheckInSummary(student, answers);
  const classification = await classifyFollowUpNeed(student, `${summary}\n${Object.values(answers).join("\n")}`);
  await createCheckIn({
    organizationId: student.organizationId,
    studentId: student.id,
    weekStart: currentWeekStart(),
    answers,
    aiSummary: summary,
    suggestedNextStep,
    followUpRecommended: classification.followUpRecommended,
    followUpReason: classification.followUpRecommended ? classification.summary : null,
  });
  if (classification.followUpRecommended) {
    await createFollowUpFlag({
      organizationId: student.organizationId,
      studentId: student.id,
      source: "check_in",
      severity: classification.severity,
      title: classification.title,
      summary: classification.summary,
      recommendedAction: classification.recommendedAction,
    });
  }
  await clearBotSession(student.telegramUserId);
  await touchStudent(student.id);
  await sendTelegramMessage({
    chatId,
    text: `Check-in saved.

Summary: ${summary}

Suggested next step: ${suggestedNextStep}`,
  });
}

async function showPlan(student: Student, chatId: string) {
  const plan = await getStudentGrowthPlan(student.organizationId, student.id);
  if (!plan) {
    await sendTelegramMessage({ chatId, text: "You do not have a growth plan yet. Send /start to continue onboarding." });
    return;
  }
  await sendTelegramMessage({
    chatId,
    text: `Your growth plan

Focus: ${plan.focusArea}
Goal: ${plan.mainGoal}
Weekly actions:
- ${plan.weeklyActions.join("\n- ")}

Reflection: ${plan.reflectionPrompt}`,
  });
}

async function handleStudentChat(student: Student, chatId: string, text: string) {
  const conversation = await getOrCreateConversation(student, chatId);
  await addMessage({
    conversationId: conversation.id,
    studentId: student.id,
    organizationId: student.organizationId,
    role: "student",
    content: text,
  });
  const recentMessages = await listRecentMessages(conversation.id, 8);
  const reply = await generateChatReply(student, conversation.runningSummary, recentMessages, text);
  await addMessage({
    conversationId: conversation.id,
    studentId: student.id,
    organizationId: student.organizationId,
    role: "assistant",
    content: reply,
  });

  const updatedRecent = await listRecentMessages(conversation.id, 10);
  const [summary, classification] = await Promise.all([
    summarizeConversation(student, updatedRecent),
    classifyFollowUpNeed(student, `${text}\n${reply}`),
  ]);
  await updateConversationSummary(conversation.id, summary);
  if (classification.followUpRecommended) {
    await createFollowUpFlag({
      organizationId: student.organizationId,
      studentId: student.id,
      source: "chat",
      severity: classification.severity,
      title: classification.title,
      summary: classification.summary,
      recommendedAction: classification.recommendedAction,
    });
    await updateStudentProfile(student.id, { status: "flagged" });
  }
  await touchStudent(student.id);
  await sendTelegramMessage({ chatId, text: reply });
}
