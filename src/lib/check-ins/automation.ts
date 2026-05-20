import { addDays, addMonths } from "date-fns";
import { createFollowUpFlag } from "@/lib/db/followUps";
import { getOrganization } from "@/lib/db/organizations";
import { getLatestStudentCheckIn } from "@/lib/db/checkIns";
import {
  getOnboarding,
  listStudentsForCheckInAutomation,
  updateStudentCheckInAutomationFields,
} from "@/lib/db/students";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { formatShortDate } from "@/lib/utils/dates";
import type { CheckInCadence, Organization, Student, StudentOnboarding } from "@/types";

const defaultCadence: CheckInCadence = "weekly";
const missedCheckInGraceDays = 2;

const cadenceLabels: Record<CheckInCadence, string> = {
  weekly: "weekly",
  twice_weekly: "twice-weekly",
  every_two_weeks: "two-week",
  monthly: "monthly",
};

export interface CheckInAutomationResult {
  checkedStudents: number;
  skippedStudents: number;
  remindersSent: number;
  flagsCreated: number;
  errors: Array<{ studentId: string; message: string }>;
}

export async function runCheckInAutomation(now = new Date()): Promise<CheckInAutomationResult> {
  const result: CheckInAutomationResult = {
    checkedStudents: 0,
    skippedStudents: 0,
    remindersSent: 0,
    flagsCreated: 0,
    errors: [],
  };
  const students = await listStudentsForCheckInAutomation();
  const organizations = new Map<string, Organization | null>();

  for (const student of students) {
    try {
      const organization = await getCachedOrganization(organizations, student.organizationId);
      if (!organization || !["active", "trial"].includes(organization.status)) {
        result.skippedStudents += 1;
        continue;
      }

      const onboarding = await getOnboarding(student.id);
      const cadence = getStudentCadence(student, onboarding);
      const anchorDate = await getCheckInAnchorDate(student, onboarding);
      if (!anchorDate) {
        result.skippedStudents += 1;
        continue;
      }

      result.checkedStudents += 1;
      const dueAt = getNextDueAt(anchorDate, cadence);
      if (now.getTime() < dueAt.getTime()) continue;

      const reminderAlreadySent = isSameDueWindow(student.lastCheckInReminderDueAt, dueAt);
      if (!reminderAlreadySent) {
        try {
          await sendTelegramMessage({
            chatId: student.telegramUserId,
            text: `Your ${cadenceLabels[cadence]} check-in is ready. Send /checkin when you have a minute to reflect on progress and choose one small next step.`,
          });
          await updateStudentCheckInAutomationFields(student.id, {
            lastCheckInReminderAt: now,
            lastCheckInReminderDueAt: dueAt,
          });
          result.remindersSent += 1;
        } catch (error) {
          result.errors.push({
            studentId: student.id,
            message: error instanceof Error ? error.message : "Telegram reminder failed",
          });
        }
      }

      const flagAt = addDays(dueAt, missedCheckInGraceDays);
      const flagAlreadyCreated = isSameDueWindow(student.lastMissedCheckInFlagDueAt, dueAt);
      if (now.getTime() >= flagAt.getTime() && !flagAlreadyCreated) {
        await createFollowUpFlag({
          organizationId: student.organizationId,
          studentId: student.id,
          source: "low_engagement",
          severity: "low",
          title: "Missed check-in",
          summary: `${student.displayName} has not completed the ${cadenceLabels[cadence]} check-in due on ${formatShortDate(dueAt)}.`,
          recommendedAction: "Send a supportive reminder or check whether the student needs help choosing a small next step.",
        });
        await updateStudentCheckInAutomationFields(student.id, {
          lastMissedCheckInFlagAt: now,
          lastMissedCheckInFlagDueAt: dueAt,
          status: "flagged",
        });
        result.flagsCreated += 1;
      }
    } catch (error) {
      result.errors.push({
        studentId: student.id,
        message: error instanceof Error ? error.message : "Unknown check-in automation error",
      });
    }
  }

  return result;
}

async function getCachedOrganization(cache: Map<string, Organization | null>, organizationId: string): Promise<Organization | null> {
  if (cache.has(organizationId)) return cache.get(organizationId) ?? null;
  const organization = await getOrganization(organizationId);
  cache.set(organizationId, organization);
  return organization;
}

function getStudentCadence(student: Student, onboarding: StudentOnboarding | null): CheckInCadence {
  if (isCheckInCadence(student.checkInCadence)) return student.checkInCadence;
  const onboardingCadence = onboarding?.answers?.checkInCadence;
  return isCheckInCadence(onboardingCadence) ? onboardingCadence : defaultCadence;
}

async function getCheckInAnchorDate(student: Student, onboarding: StudentOnboarding | null): Promise<Date | null> {
  if (student.lastCheckInAt) return student.lastCheckInAt;
  const latestCheckIn = await getLatestStudentCheckIn(student.organizationId, student.id);
  return latestCheckIn?.createdAt ?? onboarding?.completedAt ?? student.createdAt ?? null;
}

function getNextDueAt(anchorDate: Date, cadence: CheckInCadence): Date {
  if (cadence === "twice_weekly") return addDays(anchorDate, 4);
  if (cadence === "every_two_weeks") return addDays(anchorDate, 14);
  if (cadence === "monthly") return addMonths(anchorDate, 1);
  return addDays(anchorDate, 7);
}

function isCheckInCadence(value: unknown): value is CheckInCadence {
  return value === "weekly" || value === "twice_weekly" || value === "every_two_weeks" || value === "monthly";
}

function isSameDueWindow(value: Date | null | undefined, dueAt: Date): boolean {
  return Boolean(value && Math.abs(value.getTime() - dueAt.getTime()) < 1000);
}
