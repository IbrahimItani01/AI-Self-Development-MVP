export const HELP_MESSAGE = `You can use:
/checkin - weekly reflection
/plan - view your growth plan
/help - available actions
/reset - reset demo onboarding

You can also send a normal message whenever you want to reflect, get clarity, or choose a small next step.`;

export const INACTIVE_ORG_MESSAGE = "Your school account is currently inactive. Please contact your school coordinator.";

export function onboardingQuestion(step: string): string {
  const questions: Record<string, string> = {
    preferredName: "What name would you like me to use?",
    gradeLevel: "What grade level or cohort are you in?",
    focusArea: "What area would you like to improve?",
    mainChallenge: "What is the main challenge you want help thinking through?",
    progressDefinition: "What would progress look like for you in the next 30 days?",
    checkInCadence: "How often would you like a short check-in?",
  };
  return questions[step] ?? "Tell me a little more.";
}

export const focusAreaButtons = [
  ["Self-development", "Confidence"],
  ["Clarity", "Habits"],
  ["Academic direction", "Career direction"],
  ["Emotional reflection", "Goal setting"],
];
