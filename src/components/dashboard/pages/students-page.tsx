"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { DeleteStudentButton } from "@/components/dashboard/delete-student-button";
import { Badge, statusTone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import { SecondaryButton } from "@/components/ui/button";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectOpenFollowUpStudentIds } from "@/lib/redux/selectors";
import { formatRelative } from "@/lib/utils/dates";
import type { Student, StudentStatus } from "@/types";
import { deleteStudentFromDashboard } from "@/app/dashboard/students/actions";

const statusOptions = ["all", "active", "flagged", "inactive"] as const;
const onboardingOptions = ["all", "completed", "in_progress", "not_started"] as const;
const cadenceOptions = ["all", "weekly", "twice_weekly", "every_two_weeks", "monthly"] as const;
const sortOptions = ["newest", "name", "status", "last_active", "check_ins"] as const;

type Filters = {
  q: string;
  status: (typeof statusOptions)[number];
  onboarding: (typeof onboardingOptions)[number];
  cadence: (typeof cadenceOptions)[number];
  sort: (typeof sortOptions)[number];
};

const defaultFilters: Filters = {
  q: "",
  status: "all",
  onboarding: "all",
  cadence: "all",
  sort: "newest",
};

export function StudentsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const students = useAppSelector((state) => state.dashboard.students);
  const checkIns = useAppSelector((state) => state.dashboard.checkIns);
  const openFlags = useAppSelector(selectOpenFollowUpStudentIds);

  const checkInsByStudent = useMemo(() => {
    const counts = new Map<string, number>();
    checkIns.forEach((checkIn) => counts.set(checkIn.studentId, (counts.get(checkIn.studentId) ?? 0) + 1));
    return counts;
  }, [checkIns]);

  const visibleStudents = useMemo(
    () => sortStudents(filterStudents(students, openFlags, filters), checkInsByStudent, filters.sort),
    [checkInsByStudent, filters, openFlags, students],
  );
  const hasFilters = Boolean(filters.q || filters.status !== "all" || filters.onboarding !== "all" || filters.cadence !== "all" || filters.sort !== "newest");

  return (
    <div className="space-y-6">
      <SectionTitle title="Students" description="Student onboarding, engagement, focus areas, and follow-up status." />

      <div className="rounded-lg border border-ink/10 bg-surface p-4 shadow-soft">
        <div className="grid gap-3 xl:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(140px,180px))_auto]">
          <label className="relative block">
            <span className="sr-only">Search students</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value.slice(0, 80) }))}
              placeholder="Search students"
              className="h-10 w-full rounded-md border border-ink/10 bg-surface py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <Select label="Status" value={filters.status} options={statusOptions} onChange={(status) => setFilters((current) => ({ ...current, status }))} />
          <Select label="Onboarding" value={filters.onboarding} options={onboardingOptions} onChange={(onboarding) => setFilters((current) => ({ ...current, onboarding }))} />
          <Select label="Cadence" value={filters.cadence} options={cadenceOptions} onChange={(cadence) => setFilters((current) => ({ ...current, cadence }))} />
          <Select label="Sort" value={filters.sort} options={sortOptions} onChange={(sort) => setFilters((current) => ({ ...current, sort }))} />
          <div className="flex items-center">
            <SecondaryButton className="h-10 px-3" type="button" disabled={!hasFilters} onClick={() => setFilters(defaultFilters)}>
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </SecondaryButton>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
        <p>{visibleStudents.length} of {students.length} students</p>
        <p>{openFlags.size} with open follow-up</p>
      </div>

      {visibleStudents.length === 0 ? (
        <EmptyState title={students.length === 0 ? "No students yet" : "No matching students"} description={students.length === 0 ? "Create an invite code and ask students to start the Telegram bot." : "Adjust the search or filters to broaden the list."} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-surface shadow-soft">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-ink/50">
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
              {visibleStudents.map((student) => {
                const displayStatus = displayedStudentStatus(student, openFlags);

                return (
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-xs font-semibold text-ink/50">
                          {student.displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{student.displayName}</td>
                    <td className="px-4 py-3 text-ink/60">{student.telegramUsername ? `@${student.telegramUsername}` : "Not set"}</td>
                    <td className="px-4 py-3 text-ink/60">{[student.gradeLevel, student.cohort].filter(Boolean).join(" / ") || "Not set"}</td>
                    <td className="px-4 py-3 text-ink/60">{student.selectedFocusArea || "Not set"}</td>
                    <td className="px-4 py-3"><Badge tone={statusTone(displayStatus)}>{displayStatus}</Badge></td>
                    <td className="px-4 py-3 text-ink/60">{formatRelative(student.lastInteractionAt)}</td>
                    <td className="px-4 py-3">{checkInsByStudent.get(student.id) ?? 0}</td>
                    <td className="px-4 py-3">
                      <Badge tone={openFlags.has(student.id) ? "warn" : "good"}>{openFlags.has(student.id) ? "Open" : "Clear"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link href={`/dashboard/students/${student.id}`} className="font-semibold text-primary">View</Link>
                        <form action={deleteStudentFromDashboard}>
                          <input type="hidden" name="studentId" value={student.id} />
                          <input type="hidden" name="returnTo" value="/dashboard/students" />
                          <DeleteStudentButton studentName={student.displayName} />
                        </form>
                      </div>
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

function displayedStudentStatus(student: Student, openFlags: Set<string>): StudentStatus {
  return student.status === "flagged" && !openFlags.has(student.id) ? "active" : student.status;
}

function filterStudents(students: Student[], openFlags: Set<string>, filters: Filters): Student[] {
  const query = filters.q.trim().toLowerCase();
  return students.filter((student) => {
    const displayStatus = displayedStudentStatus(student, openFlags);
    if (filters.status !== "all" && displayStatus !== filters.status) return false;
    if (filters.onboarding !== "all" && student.onboardingStatus !== filters.onboarding) return false;
    if (filters.cadence !== "all" && student.checkInCadence !== filters.cadence) return false;
    if (!query) return true;
    return [
      student.displayName,
      student.telegramUsername,
      student.gradeLevel,
      student.cohort,
      student.selectedFocusArea,
      student.mainGoal,
      displayStatus,
      student.onboardingStatus,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

function sortStudents(students: Student[], checkInsByStudent: Map<string, number>, sort: Filters["sort"]): Student[] {
  return [...students].sort((a, b) => {
    if (sort === "name") return a.displayName.localeCompare(b.displayName);
    if (sort === "status") return a.status.localeCompare(b.status) || a.displayName.localeCompare(b.displayName);
    if (sort === "last_active") return (b.lastInteractionAt?.getTime() ?? 0) - (a.lastInteractionAt?.getTime() ?? 0);
    if (sort === "check_ins") return (checkInsByStudent.get(b.id) ?? 0) - (checkInsByStudent.get(a.id) ?? 0);
    return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
  });
}

function Select<T extends readonly string[]>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T[number];
  options: T;
  onChange: (value: T[number]) => void;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T[number])}
        className="h-10 w-full rounded-md border border-ink/10 bg-surface px-3 py-2 text-sm capitalize outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? `All ${label.toLowerCase()}` : labelOption(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function labelOption(value: string): string {
  return value.replaceAll("_", " ");
}
