import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listFollowUpFlags, updateFollowUpStatus } from "@/lib/db/followUps";
import { listStudents } from "@/lib/db/students";
import { formatShortDate } from "@/lib/utils/dates";
import type { FollowUpFlag, FollowUpSeverity, FollowUpStatus } from "@/types";

const statusOptions = ["all", "open", "reviewed", "closed"] as const;
const severityOptions = ["all", "high", "medium", "low"] as const;
const sourceOptions = ["all", "chat", "check_in", "low_engagement"] as const;
const sortOptions = ["newest", "oldest", "severity", "student", "status"] as const;

type SearchParams = Record<string, string | string[] | undefined>;
type FollowUpFilter = {
  q: string;
  status: (typeof statusOptions)[number];
  severity: (typeof severityOptions)[number];
  source: (typeof sourceOptions)[number];
  sort: (typeof sortOptions)[number];
};

async function updateStatus(formData: FormData) {
  "use server";
  const { organization } = await requireAdmin();
  const result = await updateFollowUpStatus(String(formData.get("flagId")), organization.id, String(formData.get("status")) as FollowUpStatus);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/follow-ups");
  revalidatePath("/dashboard/students");
  if (result.studentId) revalidatePath(`/dashboard/students/${result.studentId}`);
}

function firstParam(params: SearchParams, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function optionOrDefault<T extends readonly string[]>(value: string, options: T, fallback: T[number]): T[number] {
  return options.includes(value) ? value : fallback;
}

function parseFilters(params: SearchParams): FollowUpFilter {
  return {
    q: firstParam(params, "q").trim().slice(0, 80),
    status: optionOrDefault(firstParam(params, "status"), statusOptions, "all"),
    severity: optionOrDefault(firstParam(params, "severity"), severityOptions, "all"),
    source: optionOrDefault(firstParam(params, "source"), sourceOptions, "all"),
    sort: optionOrDefault(firstParam(params, "sort"), sortOptions, "newest"),
  };
}

function searchableText(flag: FollowUpFlag, studentName: string): string {
  return [studentName, flag.title, flag.summary, flag.recommendedAction, flag.source, flag.severity, flag.status]
    .join(" ")
    .toLowerCase();
}

function filterFlags(flags: FollowUpFlag[], names: Map<string, string>, filters: FollowUpFilter): FollowUpFlag[] {
  const query = filters.q.toLowerCase();
  return flags.filter((flag) => {
    if (filters.status !== "all" && flag.status !== filters.status) return false;
    if (filters.severity !== "all" && flag.severity !== filters.severity) return false;
    if (filters.source !== "all" && flag.source !== filters.source) return false;
    if (query && !searchableText(flag, names.get(flag.studentId) || "Student").includes(query)) return false;
    return true;
  });
}

function sortFlags(flags: FollowUpFlag[], names: Map<string, string>, sort: FollowUpFilter["sort"]): FollowUpFlag[] {
  const severityRank: Record<FollowUpSeverity, number> = { high: 0, medium: 1, low: 2 };
  const statusRank: Record<FollowUpStatus, number> = { open: 0, reviewed: 1, closed: 2 };
  return [...flags].sort((a, b) => {
    if (sort === "oldest") return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
    if (sort === "severity") return severityRank[a.severity] - severityRank[b.severity] || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    if (sort === "student") return (names.get(a.studentId) || "").localeCompare(names.get(b.studentId) || "") || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    if (sort === "status") return statusRank[a.status] - statusRank[b.status] || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
  });
}

function label(value: string): string {
  return value.replace("_", " ");
}

export default async function FollowUpsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const { organization } = await requireAdmin();
  const filters = parseFilters((await searchParams) ?? {});
  const [flags, students] = await Promise.all([listFollowUpFlags(organization.id), listStudents(organization.id)]);
  const names = new Map(students.map((student) => [student.id, student.displayName]));
  const visibleFlags = sortFlags(filterFlags(flags, names, filters), names, filters.sort);
  const hasFilters = Boolean(filters.q || filters.status !== "all" || filters.severity !== "all" || filters.source !== "all" || filters.sort !== "newest");

  return (
    <div className="space-y-6">
      <SectionTitle title="Follow-ups" description="Non-diagnostic signals for human mentor or counselor review." />

      <form action="/dashboard/follow-ups" className="rounded-lg border border-ink/10 bg-surface p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(140px,180px))_auto]">
          <label className="relative block">
            <span className="sr-only">Search follow-ups</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              name="q"
              defaultValue={filters.q}
              placeholder="Search follow-ups"
              className="h-10 w-full rounded-md border border-ink/10 bg-surface py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <Select name="status" label="Status" value={filters.status} options={statusOptions} />
          <Select name="severity" label="Severity" value={filters.severity} options={severityOptions} />
          <Select name="source" label="Source" value={filters.source} options={sourceOptions} />
          <Select name="sort" label="Sort" value={filters.sort} options={sortOptions} />
          <div className="flex items-center gap-2">
            <SecondaryButton className="h-10 px-3" type="submit">
              <Search className="h-4 w-4" aria-hidden="true" />
              Apply
            </SecondaryButton>
            {hasFilters ? (
              <Link href="/dashboard/follow-ups" className="inline-flex h-10 items-center justify-center rounded-md border border-ink/10 px-3 text-sm font-semibold text-ink hover:bg-canvas">
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Clear</span>
              </Link>
            ) : null}
          </div>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink/60">
        <p>{visibleFlags.length} of {flags.length} follow-ups</p>
        <p>{flags.filter((flag) => flag.status === "open").length} open</p>
      </div>

      {visibleFlags.length === 0 ? (
        <EmptyState title={flags.length === 0 ? "No follow-up flags" : "No matching follow-ups"} description={flags.length === 0 ? "Flags appear here when the AI detects a student may benefit from human follow-up." : "Adjust the search or filters to broaden the list."} />
      ) : (
        <div className="grid gap-4">
          {visibleFlags.map((flag) => (
            <div key={flag.id} className="rounded-lg border border-ink/10 bg-surface p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{flag.title}</h2>
                    <Badge tone={statusTone(flag.severity)}>{flag.severity}</Badge>
                    <Badge tone={statusTone(flag.status)}>{flag.status}</Badge>
                    <Badge>{label(flag.source)}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <Link href={`/dashboard/students/${flag.studentId}`} className="font-medium text-primary">
                      {names.get(flag.studentId) || "Student"}
                    </Link>
                    <span className="text-ink/50">{formatShortDate(flag.createdAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {flag.status !== "reviewed" ? (
                    <form action={updateStatus}>
                      <input type="hidden" name="flagId" value={flag.id} />
                      <input type="hidden" name="status" value="reviewed" />
                      <SecondaryButton>Mark reviewed</SecondaryButton>
                    </form>
                  ) : null}
                  {flag.status !== "closed" ? (
                    <form action={updateStatus}>
                      <input type="hidden" name="flagId" value={flag.id} />
                      <input type="hidden" name="status" value="closed" />
                      <SecondaryButton>Close</SecondaryButton>
                    </form>
                  ) : null}
                  {flag.status !== "open" ? (
                    <form action={updateStatus}>
                      <input type="hidden" name="flagId" value={flag.id} />
                      <input type="hidden" name="status" value="open" />
                      <SecondaryButton>Reopen</SecondaryButton>
                    </form>
                  ) : null}
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

function Select<T extends readonly string[]>({
  name,
  label: labelText,
  value,
  options,
}: {
  name: string;
  label: string;
  value: T[number];
  options: T;
}) {
  return (
    <label className="block">
      <span className="sr-only">{labelText}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-10 w-full rounded-md border border-ink/10 bg-surface px-3 py-2 text-sm capitalize outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? `All ${labelText.toLowerCase()}` : label(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
