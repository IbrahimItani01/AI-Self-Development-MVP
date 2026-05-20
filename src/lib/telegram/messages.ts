export const HELP_MESSAGE = `You can use:
/checkin - weekly reflection
/plan - view your growth plan
/help - available actions
/reset - reset demo onboarding
/delete - delete your student account and saved bot data

You can also send a normal message whenever you want to reflect, get clarity, or choose a small next step.`;

export const INACTIVE_ORG_MESSAGE = "Your school account is currently inactive. Please contact your school coordinator.";

type QuestionContext = {
  displayName?: string | null;
  focusArea?: string | null;
  mainGoal?: string | null;
  cadence?: string | null;
  answers?: Record<string, unknown>;
};

function textAnswer(answers: Record<string, unknown> | undefined, key: string): string | null {
  const value = answers?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function shortReference(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  return value.length > 90 ? `${value.slice(0, 87).trim()}...` : value;
}

export function onboardingQuestion(step: string, context: QuestionContext = {}): string {
  const focusArea = textAnswer(context.answers, "focusArea") ?? context.focusArea;
  const mainChallenge = textAnswer(context.answers, "mainChallenge") ?? context.mainGoal;
  const questions: Record<string, string> = {
    preferredName: "What username would you like me to use? You can send your first name, nickname, or school username.",
    gradeLevel: "Which Lebanese school grade are you in? Choose the closest option.",
    focusArea: "What area would you like to focus on first? You can change direction later.",
    mainChallenge: focusArea
      ? `For ${focusArea.toLowerCase()}, what is the main challenge you want help thinking through right now?\n\nExample: I procrastinate before exams, or I am unsure what major fits me.`
      : "What is the main challenge you want help thinking through right now?\n\nExample: I procrastinate before exams, or I am unsure what major fits me.",
    progressDefinition: mainChallenge
      ? `What would progress look like for "${shortReference(mainChallenge, "this")}" over the next week or few weeks?\n\nChoose the time horizon that feels useful to you.`
      : "What would progress look like over the next week or few weeks?\n\nChoose the time horizon that feels useful to you. Example: I finish homework earlier 3 days this week, or I feel clearer about my next academic step.",
    checkInCadence: "How often would you like a short check-in? Choose one option.",
  };
  return questions[step] ?? "Tell me a little more.";
}

export function checkInQuestion(step: string, context: QuestionContext = {}): string {
  const focus = shortReference(context.focusArea, "your focus area");
  const goal = shortReference(context.mainGoal, "your current goal");
  const progress = textAnswer(context.answers, "progress");
  const difficulty = textAnswer(context.answers, "difficulty");

  const questions: Record<string, string> = {
    progress: `Quick check-in on ${focus}: what progress have you made since your last reflection?`,
    difficulty: progress
      ? `Nice. Looking at that progress, what felt difficult or got in the way?`
      : `What felt difficult or got in the way of ${goal}?`,
    insight: difficulty
      ? `What did that teach you about yourself, your habits, or what support you may need?`
      : "What did you learn about yourself this week?",
    nextStep: `What is one small next step that would move you closer to ${goal}?`,
  };

  return questions[step] ?? "Tell me a little more.";
}

export const lebanonGradeOptions = [
  { id: "g1", label: "Grade 1", value: "Grade 1" },
  { id: "g2", label: "Grade 2", value: "Grade 2" },
  { id: "g3", label: "Grade 3", value: "Grade 3" },
  { id: "g4", label: "Grade 4", value: "Grade 4" },
  { id: "g5", label: "Grade 5", value: "Grade 5" },
  { id: "g6", label: "Grade 6", value: "Grade 6" },
  { id: "g7", label: "Grade 7", value: "Grade 7" },
  { id: "g8", label: "Grade 8", value: "Grade 8" },
  { id: "g9", label: "Grade 9 / Brevet", value: "Grade 9 / Brevet" },
  { id: "g10", label: "Grade 10", value: "Grade 10" },
  { id: "g11_h", label: "Grade 11 Humanities", value: "Grade 11 Humanities" },
  { id: "g11_s", label: "Grade 11 Sciences", value: "Grade 11 Sciences" },
  { id: "g12_lh", label: "Grade 12 LH", value: "Grade 12 Literature and Humanities" },
  { id: "g12_se", label: "Grade 12 SE", value: "Grade 12 Sociology and Economics" },
  { id: "g12_gs", label: "Grade 12 GS", value: "Grade 12 General Sciences" },
  { id: "g12_ls", label: "Grade 12 LS", value: "Grade 12 Life Sciences" },
  { id: "other", label: "Other / unsure", value: "Other / unsure" },
];

export const focusAreaButtons = [
  ["Self-development", "Confidence"],
  ["Clarity", "Habits"],
  ["Academic direction", "Career direction"],
  ["Emotional reflection", "Goal setting"],
];

export const checkInCadenceOptions = [
  { id: "weekly", label: "Weekly", value: "weekly" },
  { id: "twice_weekly", label: "Twice a week", value: "twice_weekly" },
  { id: "every_two_weeks", label: "Every 2 weeks", value: "every_two_weeks" },
  { id: "monthly", label: "Monthly", value: "monthly" },
];
