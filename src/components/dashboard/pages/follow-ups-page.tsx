"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { FormSecondaryButton, SecondaryButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectStudentNames, statusRank } from "@/lib/redux/selectors";
import { formatShortDate } from "@/lib/utils/dates";
import type { FollowUpFlag, FollowUpSeverity, FollowUpStatus } from "@/types";
import { updateFollowUpStatusFromDashboard } from "@/app/dashboard/follow-ups/actions";

const statusOptions = ["all", "open", "reviewed", "closed"] as const;
const severityOptions = ["all", "high", "medium", "low"] as const;
const sourceOptions = ["all", "chat", "check_in", "low_engagement"] as const;
const sortOptions = ["newest", "oldest", "severity", "student", "status"] as const;

type FollowUpFilter = {
  q: string;
  status: (typeof statusOptions)[number];
  severity: (typeof severityOptions)[number];
  source: (typeof sourceOptions)[number];
  sort: (typeof sortOptions)[number];
};

const defaultFilters: FollowUpFilter = {
  q: "",
  status: "all",
  severity: "all",
  source: "all",
  sort: "newest",
};

export function FollowUpsPage() {
  const [filters, setFilters] = useState<FollowUpFilter>(defaultFilters);
  const flags = useAppSelector((state) => state.dashboard.followUpFlags);
  const names = useAppSelector(selectStudentNames);

  const visibleFlags = useMemo(
    () => sortFlags(filterFlags(flags, names, filters), names, filters.sort),
    [filters, flags, names],
  );
  const hasFilters = Boolean(filters.q || filters.status !== "all" || filters.severity !== "all" || filters.source !== "all" || filters.sort !== "newest");

  return (
    <div className="space-y-6">
      <SectionTitle title="Follow-ups" description="Non-diagnostic signals for human mentor or counselor review." />

      <div className="rounded-lg border border-ink/10 bg-surface p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(140px,180px))_auto]">
          <label className="relative block">
            <span className="sr-only">Search follow-ups</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value.slice(0, 80) }))}
              placeholder="Search follow-ups"
              className="h-10 w-full rounded-md border border-ink/10 bg-surface py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <Select label="Status" value={filters.status} options={statusOptions} onChange={(status) => setFilters((current) => ({ ...current, status }))} />
          <Select label="Severity" value={filters.severity} options={severityOptions} onChange={(severity) => setFilters((current) => ({ ...current, severity }))} />
          <Select label="Source" value={filters.source} options={sourceOptions} onChange={(source) => setFilters((current) => ({ ...current, source }))} />
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
                    <StatusForm flagId={flag.id} status="reviewed" label="Mark reviewed" />
                  ) : null}
                  {flag.status !== "closed" ? (
                    <StatusForm flagId={flag.id} status="closed" label="Close" />
                  ) : null}
                  {flag.status !== "open" ? (
                    <StatusForm flagId={flag.id} status="open" label="Reopen" />
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

function StatusForm({ flagId, status, label: labelText }: { flagId: string; status: FollowUpStatus; label: string }) {
  return (
    <form action={updateFollowUpStatusFromDashboard}>
      <input type="hidden" name="flagId" value={flagId} />
      <input type="hidden" name="status" value={status} />
      <FormSecondaryButton pendingText="Saving...">{labelText}</FormSecondaryButton>
    </form>
  );
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
  return [...flags].sort((a, b) => {
    if (sort === "oldest") return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
    if (sort === "severity") return severityRank[a.severity] - severityRank[b.severity] || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    if (sort === "student") return (names.get(a.studentId) || "").localeCompare(names.get(b.studentId) || "") || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    if (sort === "status") return statusRank(a.status) - statusRank(b.status) || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
  });
}

function Select<T extends readonly string[]>({
  label: labelText,
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
      <span className="sr-only">{labelText}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T[number])}
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

function label(value: string): string {
  return value.replaceAll("_", " ");
}
