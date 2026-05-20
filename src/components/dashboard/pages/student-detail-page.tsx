"use client";

import { useEffect } from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { DeleteStudentButton } from "@/components/dashboard/delete-student-button";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { selectOpenFollowUpStudentIds } from "@/lib/redux/selectors";
import { setDashboardError, setStudentMessageLoading, setStudentMessages } from "@/lib/redux/dashboardSlice";
import { getFirebaseDb } from "@/lib/firebase/client";
import { formatRelative, formatShortDate } from "@/lib/utils/dates";
import { cleanAIGeneratedText } from "@/lib/utils/text";
import type { Message } from "@/types";
import { deleteStudentFromDashboard } from "@/app/dashboard/students/actions";

export function StudentDetailPage({ studentId }: { studentId: string }) {
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector((state) => state.dashboard.organization?.id);
  const student = useAppSelector((state) => state.dashboard.students.find((item) => item.id === studentId) ?? null);
  const growthPlan = useAppSelector((state) => state.dashboard.growthPlans.find((plan) => plan.studentId === studentId) ?? null);
  const conversation = useAppSelector((state) => state.dashboard.conversations.find((item) => item.studentId === studentId) ?? null);
  const checkIns = useAppSelector((state) => state.dashboard.checkIns.filter((checkIn) => checkIn.studentId === studentId).slice(0, 10));
  const flags = useAppSelector((state) => state.dashboard.followUpFlags.filter((flag) => flag.studentId === studentId));
  const recentMessages = useAppSelector((state) => state.dashboard.messagesByStudent[studentId]?.slice(-12) ?? []);
  const openFlags = useAppSelector(selectOpenFollowUpStudentIds);

  useEffect(() => {
    if (!organizationId) return;
    dispatch(setStudentMessageLoading(studentId));
    const unsubscribe = onSnapshot(
      query(collection(getFirebaseDb(), "messages"), where("organizationId", "==", organizationId), where("studentId", "==", studentId)),
      (snap) => {
        const messages = snap.docs
          .map((messageDoc) => fromFirestoreDoc<Message>(messageDoc))
          .sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
        dispatch(setStudentMessages({ studentId, messages }));
      },
      (error) => dispatch(setDashboardError(error.message || "Student messages could not be loaded.")),
    );
    return unsubscribe;
  }, [dispatch, organizationId, studentId]);

  if (!student) {
    return (
      <div className="space-y-6">
        <EmptyState title="Student not found" description="This student may have been removed or may not belong to this organization." />
        <Link href="/dashboard/students" className="font-semibold text-primary">Back to students</Link>
      </div>
    );
  }

  const displayStatus = student.status === "flagged" && !openFlags.has(student.id) ? "active" : student.status;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title={student.displayName} description="Student profile, progress memory, and school-facing summaries." />
        <Badge tone={statusTone(displayStatus)}>{displayStatus}</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Telegram" value={student.telegramUsername ? `@${student.telegramUsername}` : "Not set"} />
            <Row label="Grade" value={student.gradeLevel || "Not set"} />
            <Row label="Cohort" value={student.cohort || "Not set"} />
            <Row label="Focus" value={student.selectedFocusArea || "Not set"} />
            <Row label="Goal" value={student.mainGoal || "Not set"} />
            <Row label="Last active" value={formatRelative(student.lastInteractionAt)} />
          </dl>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Growth plan</h2>
          {growthPlan ? (
            <div className="mt-4 space-y-4 text-sm text-ink/70">
              <p><strong className="text-ink">Focus:</strong> {growthPlan.focusArea}</p>
              <p><strong className="text-ink">Main goal:</strong> {growthPlan.mainGoal}</p>
              <div>
                <strong className="text-ink">Weekly actions</strong>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {growthPlan.weeklyActions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </div>
              <p><strong className="text-ink">Reflection prompt:</strong> {growthPlan.reflectionPrompt}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink/60">No growth plan saved yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-semibold">Running AI progress summary</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">{conversation?.runningSummary || "No conversation summary yet."}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Recent check-ins</h2>
          <div className="mt-4 space-y-4">
            {checkIns.length ? checkIns.map((checkIn) => (
              <div key={checkIn.id} className="rounded-md border border-ink/10 p-4">
                <p className="text-xs text-ink/50">{formatShortDate(checkIn.createdAt)}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink/70">{cleanAIGeneratedText(checkIn.aiSummary)}</p>
                <p className="mt-3 rounded-md border-l-2 border-primary/40 bg-primary/5 px-3 py-2 text-sm font-medium leading-6 text-primaryDark">
                  {cleanAIGeneratedText(checkIn.suggestedNextStep)}
                </p>
              </div>
            )) : <p className="text-sm text-ink/60">No check-ins yet.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Follow-up flags</h2>
          <div className="mt-4 space-y-4">
            {flags.length ? flags.map((flag) => (
              <div key={flag.id} className="rounded-md border border-ink/10 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{flag.title}</p>
                  <Badge tone={statusTone(flag.severity)}>{flag.severity}</Badge>
                </div>
                <p className="mt-2 text-sm text-ink/70">{flag.summary}</p>
                <p className="mt-2 text-sm text-ink/60">{flag.recommendedAction}</p>
              </div>
            )) : <p className="text-sm text-ink/60">No follow-up flags.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <details>
          <summary className="cursor-pointer font-semibold">Review conversation context</summary>
          <p className="mt-3 text-sm text-ink/60">
            Student conversations should be reviewed responsibly and only when there is a legitimate school support reason.
          </p>
          <div className="mt-4 space-y-3">
            {recentMessages.length ? recentMessages.map((message) => (
              <div key={message.id} className="rounded-md bg-canvas p-3 text-sm">
                <p className="font-semibold capitalize">{message.role}</p>
                <p className="mt-1 break-words text-ink/70">{message.content}</p>
              </div>
            )) : <p className="text-sm text-ink/60">No recent messages loaded yet.</p>}
          </div>
        </details>
      </Card>

      <Card className="border-danger/25 bg-danger/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-danger">Remove student account</h2>
            <p className="mt-2 text-sm text-danger">
              Deletes this student and their onboarding, plan, messages, check-ins, follow-up flags, bot session, and usage logs for this organization.
            </p>
          </div>
          <form action={deleteStudentFromDashboard}>
            <input type="hidden" name="studentId" value={student.id} />
            <input type="hidden" name="returnTo" value="/dashboard/students" />
            <DeleteStudentButton studentName={student.displayName} />
          </form>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink/50">{label}</dt>
      <dd className="break-words text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function fromFirestoreDoc<T extends { id: string }>(snapshot: QueryDocumentSnapshot<DocumentData>): T {
  return { id: snapshot.id, ...(normalizeFirestoreValue(snapshot.data()) as Record<string, unknown>) } as T;
}

function normalizeFirestoreValue(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if ("toDate" in value && typeof value.toDate === "function") return value.toDate();
  if (Array.isArray(value)) return value.map((item) => normalizeFirestoreValue(item));
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeFirestoreValue(item)]));
}
