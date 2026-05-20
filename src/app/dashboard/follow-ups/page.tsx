import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Badge, statusTone } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listFollowUpFlags, updateFollowUpStatus } from "@/lib/db/followUps";
import { listStudents } from "@/lib/db/students";
import type { FollowUpStatus } from "@/types";

async function updateStatus(formData: FormData) {
  "use server";
  const { organization } = await requireAdmin();
  await updateFollowUpStatus(String(formData.get("flagId")), organization.id, String(formData.get("status")) as FollowUpStatus);
  revalidatePath("/dashboard/follow-ups");
}

export default async function FollowUpsPage() {
  const { organization } = await requireAdmin();
  const [flags, students] = await Promise.all([listFollowUpFlags(organization.id), listStudents(organization.id)]);
  const names = new Map(students.map((student) => [student.id, student.displayName]));

  return (
    <div className="space-y-6">
      <SectionTitle title="Follow-ups" description="Non-diagnostic signals for human mentor or counselor review." />
      {flags.length === 0 ? (
        <EmptyState title="No follow-up flags" description="Flags appear here when the AI detects a student may benefit from human follow-up." />
      ) : (
        <div className="grid gap-4">
          {flags.map((flag) => (
            <div key={flag.id} className="rounded-lg border border-ink/10 bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{flag.title}</h2>
                    <Badge tone={statusTone(flag.severity)}>{flag.severity}</Badge>
                    <Badge tone={statusTone(flag.status)}>{flag.status}</Badge>
                  </div>
                  <Link href={`/dashboard/students/${flag.studentId}`} className="mt-2 block text-sm font-medium text-primary">
                    {names.get(flag.studentId) || "Student"}
                  </Link>
                </div>
                <div className="flex gap-2">
                  <form action={updateStatus}>
                    <input type="hidden" name="flagId" value={flag.id} />
                    <input type="hidden" name="status" value="reviewed" />
                    <SecondaryButton>Mark reviewed</SecondaryButton>
                  </form>
                  <form action={updateStatus}>
                    <input type="hidden" name="flagId" value={flag.id} />
                    <input type="hidden" name="status" value="closed" />
                    <SecondaryButton>Close</SecondaryButton>
                  </form>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-ink/70">{flag.summary}</p>
              <p className="mt-3 text-sm font-medium text-ink">{flag.recommendedAction}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
