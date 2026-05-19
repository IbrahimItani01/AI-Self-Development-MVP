import Link from "next/link";
import Image from "next/image";
import { DeleteStudentButton } from "@/components/dashboard/delete-student-button";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listStudents } from "@/lib/db/students";
import { listRecentCheckIns } from "@/lib/db/checkIns";
import { listFollowUpFlags } from "@/lib/db/followUps";
import { formatRelative } from "@/lib/utils/dates";
import { deleteStudentFromDashboard } from "./actions";

export default async function StudentsPage() {
  const { organization } = await requireAdmin();
  const [students, checkIns, flags] = await Promise.all([
    listStudents(organization.id),
    listRecentCheckIns(organization.id, 200),
    listFollowUpFlags(organization.id),
  ]);

  const checkInsByStudent = new Map<string, number>();
  checkIns.forEach((checkIn) => checkInsByStudent.set(checkIn.studentId, (checkInsByStudent.get(checkIn.studentId) ?? 0) + 1));
  const openFlags = new Set(flags.filter((flag) => flag.status === "open").map((flag) => flag.studentId));

  return (
    <div className="space-y-6">
      <SectionTitle title="Students" description="Student onboarding, engagement, focus areas, and follow-up status." />
      {students.length === 0 ? (
        <EmptyState title="No students yet" description="Create an invite code and ask students to start the Telegram bot." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-sand text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Photo</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Telegram</th>
                <th className="px-4 py-3">Grade/cohort</th>
                <th className="px-4 py-3">Focus area</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last interaction</th>
                <th className="px-4 py-3">Check-ins</th>
                <th className="px-4 py-3">Follow-up</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-4 py-3">
                    {student.telegramPhotoFileId ? (
                      <Image
                        src={`/api/telegram/photo/${encodeURIComponent(student.telegramPhotoFileId)}`}
                        alt={`${student.displayName} Telegram profile`}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-full border border-ink/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-xs font-semibold text-ink/50">
                        {student.displayName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{student.displayName}</td>
                  <td className="px-4 py-3 text-ink/60">{student.telegramUsername ? `@${student.telegramUsername}` : "Not set"}</td>
                  <td className="px-4 py-3 text-ink/60">{[student.gradeLevel, student.cohort].filter(Boolean).join(" / ") || "Not set"}</td>
                  <td className="px-4 py-3 text-ink/60">{student.selectedFocusArea || "Not set"}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(student.status)}>{student.status}</Badge></td>
                  <td className="px-4 py-3 text-ink/60">{formatRelative(student.lastInteractionAt)}</td>
                  <td className="px-4 py-3">{checkInsByStudent.get(student.id) ?? 0}</td>
                  <td className="px-4 py-3">
                    <Badge tone={openFlags.has(student.id) ? "warn" : "good"}>{openFlags.has(student.id) ? "Open" : "Clear"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/students/${student.id}`} className="font-semibold text-wine">View</Link>
                      <form action={deleteStudentFromDashboard}>
                        <input type="hidden" name="studentId" value={student.id} />
                        <input type="hidden" name="returnTo" value="/dashboard/students" />
                        <DeleteStudentButton studentName={student.displayName} />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
