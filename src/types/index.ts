export type OrganizationStatus = "active" | "inactive" | "past_due" | "canceled" | "trial";
export type OrganizationPlan = "pilot" | "school" | "pro" | "custom";
export type AdminRole = "owner" | "admin" | "counselor";
export type StudentStatus = "active" | "inactive" | "flagged";
export type OnboardingStatus = "not_started" | "in_progress" | "completed";
export type MessageRole = "student" | "assistant" | "system";
export type FollowUpSeverity = "low" | "medium" | "high";
export type FollowUpStatus = "open" | "reviewed" | "closed";
export type FollowUpSource = "chat" | "check_in" | "low_engagement";
export type UsageType = "chat" | "summary" | "check_in" | "classification" | "growth_plan";

export interface BaseDocument {
  id: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface Organization extends BaseDocument {
  name: string;
  slug: string;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  maxStudents: number;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionCurrentPeriodEnd?: Date | null;
}

export interface OrganizationAdmin extends BaseDocument {
  organizationId: string;
  firebaseUid: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface InviteCode extends BaseDocument {
  organizationId: string;
  code: string;
  label: string;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: Date | null;
}

export interface Student extends BaseDocument {
  organizationId: string;
  telegramUserId: string;
  telegramUsername?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName: string;
  gradeLevel?: string | null;
  cohort?: string | null;
  onboardingStatus: OnboardingStatus;
  selectedFocusArea?: string | null;
  mainGoal?: string | null;
  status: StudentStatus;
  lastInteractionAt?: Date | null;
}

export interface StudentOnboarding extends BaseDocument {
  studentId: string;
  organizationId: string;
  answers: Record<string, unknown>;
  completedAt?: Date | null;
}

export interface Conversation extends BaseDocument {
  studentId: string;
  organizationId: string;
  telegramChatId: string;
  title: string;
  lastMessageAt?: Date | null;
  runningSummary?: string | null;
}

export interface Message extends BaseDocument {
  conversationId: string;
  studentId: string;
  organizationId: string;
  role: MessageRole;
  content: string;
}

export interface CheckInAnswers {
  progress: string;
  difficulty: string;
  insight: string;
  nextStep: string;
}

export interface CheckIn extends BaseDocument {
  studentId: string;
  organizationId: string;
  weekStart: Date | null;
  answers: CheckInAnswers;
  aiSummary: string;
  suggestedNextStep: string;
  followUpRecommended: boolean;
  followUpReason?: string | null;
}

export interface GrowthPlan extends BaseDocument {
  studentId: string;
  organizationId: string;
  focusArea: string;
  mainGoal: string;
  focusAreas: string[];
  weeklyActions: string[];
  reflectionPrompt: string;
  suggestedNextStep: string;
}

export interface FollowUpFlag extends BaseDocument {
  studentId: string;
  organizationId: string;
  source: FollowUpSource;
  severity: FollowUpSeverity;
  title: string;
  summary: string;
  recommendedAction: string;
  status: FollowUpStatus;
}

export interface UsageLog extends BaseDocument {
  organizationId: string;
  studentId?: string | null;
  type: UsageType;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface StripeEventLog {
  id: string;
  stripeEventId: string;
  type: string;
  processed: boolean;
  createdAt: Date | null;
}

export interface AdminContext {
  admin: OrganizationAdmin;
  organization: Organization;
}

export interface DashboardOverview {
  organization: Organization;
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  openFollowUps: number;
  weeklyCheckIns: number;
  monthlyTokens: number;
  monthlyEstimatedCost: number;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number; type: string };
  text?: string;
  date: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}
