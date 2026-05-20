import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listRecentCheckIns } from "@/lib/db/checkIns";
import { listStudents } from "@/lib/db/students";
import { formatShortDate } from "@/lib/utils/dates";
import { cleanAIGeneratedText } from "@/lib/utils/text";

export default async function CheckInsPage() {
  const { organization } = await requireAdmin();
  const [checkIns, students] = await Promise.all([listRecentCheckIns(organization.id), listStudents(organization.id)]);
  const names = new Map(students.map((student) => [student.id, student.displayName]));

  return (
    <div className="space-y-6">
      <SectionTitle title="Weekly Check-ins" description="Recent student reflections, AI summaries, and suggested next steps." />
      {checkIns.length === 0 ? (
        <EmptyState title="No check-ins yet" description="Students can complete a weekly check-in from Telegram with /checkin." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-surface shadow-soft">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">AI summary</th>
                <th className="px-4 py-3">Suggested next step</th>
                <th className="px-4 py-3">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {checkIns.map((checkIn) => {
                const summary = cleanAIGeneratedText(checkIn.aiSummary);
                const suggestedNextStep = cleanAIGeneratedText(checkIn.suggestedNextStep);

                return (
                  <tr key={checkIn.id} className="align-top">
                    <td className="px-4 py-3 font-medium">
                      <Link className="text-primary" href={`/dashboard/students/${checkIn.studentId}`}>
                        {names.get(checkIn.studentId) || "Student"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{formatShortDate(checkIn.createdAt)}</td>
                    <td className="max-w-md px-4 py-3">
                      <p className="whitespace-pre-line rounded-md bg-canvas/60 px-3 py-2 leading-6 text-ink/75">{summary}</p>
                    </td>
                    <td className="max-w-sm px-4 py-3">
                      <p className="whitespace-pre-line rounded-md border-l-2 border-primary/40 bg-primary/5 px-3 py-2 leading-6 text-ink/75">{suggestedNextStep}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={checkIn.followUpRecommended ? "warn" : "good"}>{checkIn.followUpRecommended ? "Recommended" : "No signal"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
