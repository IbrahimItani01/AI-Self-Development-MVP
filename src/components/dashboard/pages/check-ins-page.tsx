"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/card";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectStudentNames } from "@/lib/redux/selectors";
import { formatShortDate } from "@/lib/utils/dates";
import { cleanAIGeneratedText } from "@/lib/utils/text";
import type { CheckIn } from "@/types";

const followUpOptions = ["all", "recommended", "no_signal"] as const;
const sortOptions = ["newest", "oldest", "student", "follow_up"] as const;

type Filters = {
  q: string;
  followUp: (typeof followUpOptions)[number];
  sort: (typeof sortOptions)[number];
};

const defaultFilters: Filters = {
  q: "",
  followUp: "all",
  sort: "newest",
};

export function CheckInsPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const checkIns = useAppSelector((state) => state.dashboard.checkIns);
  const names = useAppSelector(selectStudentNames);

  const visibleCheckIns = useMemo(
    () => sortCheckIns(filterCheckIns(checkIns, names, filters), names, filters.sort),
    [checkIns, filters, names],
  );
  const hasFilters = Boolean(filters.q || filters.followUp !== "all" || filters.sort !== "newest");

  return (
    <div className="space-y-6">
      <SectionTitle title="Weekly Check-ins" description="Recent student reflections, AI summaries, and suggested next steps." />

      <div className="rounded-lg border border-ink/10 bg-surface p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(150px,190px)_minmax(150px,190px)_auto]">
          <label className="relative block">
            <span className="sr-only">Search check-ins</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value.slice(0, 80) }))}
              placeholder="Search check-ins"
              className="h-10 w-full rounded-md border border-ink/10 bg-surface py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <Select label="Follow-up" value={filters.followUp} options={followUpOptions} onChange={(followUp) => setFilters((current) => ({ ...current, followUp }))} />
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
        <p>{visibleCheckIns.length} of {checkIns.length} check-ins</p>
        <p>{checkIns.filter((checkIn) => checkIn.followUpRecommended).length} with follow-up signal</p>
      </div>

      {visibleCheckIns.length === 0 ? (
        <EmptyState title={checkIns.length === 0 ? "No check-ins yet" : "No matching check-ins"} description={checkIns.length === 0 ? "Students can complete a weekly check-in from Telegram with /checkin." : "Adjust the search or filters to broaden the list."} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 bg-surface shadow-soft">
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
              {visibleCheckIns.map((checkIn) => {
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

function filterCheckIns(checkIns: CheckIn[], names: Map<string, string>, filters: Filters): CheckIn[] {
  const query = filters.q.trim().toLowerCase();
  return checkIns.filter((checkIn) => {
    if (filters.followUp === "recommended" && !checkIn.followUpRecommended) return false;
    if (filters.followUp === "no_signal" && checkIn.followUpRecommended) return false;
    if (!query) return true;
    return [
      names.get(checkIn.studentId),
      checkIn.aiSummary,
      checkIn.suggestedNextStep,
      checkIn.followUpReason,
      checkIn.answers.progress,
      checkIn.answers.difficulty,
      checkIn.answers.insight,
      checkIn.answers.nextStep,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

function sortCheckIns(checkIns: CheckIn[], names: Map<string, string>, sort: Filters["sort"]): CheckIn[] {
  return [...checkIns].sort((a, b) => {
    if (sort === "oldest") return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
    if (sort === "student") return (names.get(a.studentId) || "").localeCompare(names.get(b.studentId) || "") || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    if (sort === "follow_up") return Number(b.followUpRecommended) - Number(a.followUpRecommended) || (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
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
