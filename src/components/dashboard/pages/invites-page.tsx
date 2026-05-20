"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { FormButton, FormSecondaryButton, SecondaryButton } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppSelector } from "@/lib/redux/hooks";
import { formatShortDate } from "@/lib/utils/dates";
import type { InviteCode } from "@/types";
import { createInviteFromDashboard, setInviteActiveFromDashboard } from "@/app/dashboard/invites/actions";

const statusOptions = ["all", "active", "inactive"] as const;
const availabilityOptions = ["all", "available", "full", "expired"] as const;
const sortOptions = ["newest", "code", "status", "uses", "expiry"] as const;

type Filters = {
  q: string;
  status: (typeof statusOptions)[number];
  availability: (typeof availabilityOptions)[number];
  sort: (typeof sortOptions)[number];
};

const defaultFilters: Filters = {
  q: "",
  status: "all",
  availability: "all",
  sort: "newest",
};

export function InvitesPage() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const invites = useAppSelector((state) => state.dashboard.inviteCodes);
  const visibleInvites = useMemo(() => sortInvites(filterInvites(invites, filters), filters.sort), [filters, invites]);
  const hasFilters = Boolean(filters.q || filters.status !== "all" || filters.availability !== "all" || filters.sort !== "newest");

  return (
    <div className="space-y-6">
      <SectionTitle title="Invite Codes" description="Generate unique school invite codes students can use in Telegram." />
      <Card>
        <form action={createInviteFromDashboard} className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-medium">
            Label
            <input name="label" className="mt-1 w-full rounded-md border border-ink/10 px-3 py-2" placeholder="Grade 10 pilot" />
          </label>
          <label className="text-sm font-medium">
            Max uses
            <input name="maxUses" type="number" min="1" className="mt-1 w-full rounded-md border border-ink/10 px-3 py-2" placeholder="50" />
          </label>
          <label className="text-sm font-medium">
            Expiry
            <input name="expiresAt" type="date" className="mt-1 w-full rounded-md border border-ink/10 px-3 py-2" />
          </label>
          <div className="flex items-end">
            <FormButton className="w-full" pendingText="Generating...">Generate invite</FormButton>
          </div>
        </form>
      </Card>

      <div className="rounded-lg border border-ink/10 bg-surface p-4 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(140px,180px))_auto]">
          <label className="relative block">
            <span className="sr-only">Search invites</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" aria-hidden="true" />
            <input
              value={filters.q}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value.slice(0, 80) }))}
              placeholder="Search invites"
              className="h-10 w-full rounded-md border border-ink/10 bg-surface py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <Select label="Status" value={filters.status} options={statusOptions} onChange={(status) => setFilters((current) => ({ ...current, status }))} />
          <Select label="Availability" value={filters.availability} options={availabilityOptions} onChange={(availability) => setFilters((current) => ({ ...current, availability }))} />
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
        <p>{visibleInvites.length} of {invites.length} invite codes</p>
        <p>{invites.filter((invite) => invite.active).length} active</p>
      </div>

      {visibleInvites.length === 0 ? (
        <EmptyState title={invites.length === 0 ? "No invite codes" : "No matching invite codes"} description={invites.length === 0 ? "Generate one invite code for students to join your school bot flow." : "Adjust the search or filters to broaden the list."} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ink/10 bg-surface shadow-soft">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {visibleInvites.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-4 py-3 font-semibold text-primary">{invite.code}</td>
                  <td className="px-4 py-3">{invite.label}</td>
                  <td className="px-4 py-3">{invite.usedCount} / {invite.maxUses ?? "Unlimited"}</td>
                  <td className="px-4 py-3">{formatShortDate(invite.expiresAt)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(invite.active ? "active" : "inactive")}>{invite.active ? "active" : "inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    <form action={setInviteActiveFromDashboard}>
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <input type="hidden" name="active" value={String(!invite.active)} />
                      <FormSecondaryButton pendingText="Saving...">{invite.active ? "Deactivate" : "Activate"}</FormSecondaryButton>
                    </form>
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

function filterInvites(invites: InviteCode[], filters: Filters): InviteCode[] {
  const query = filters.q.trim().toLowerCase();
  const now = Date.now();
  return invites.filter((invite) => {
    if (filters.status === "active" && !invite.active) return false;
    if (filters.status === "inactive" && invite.active) return false;
    if (filters.availability === "available" && (!invite.active || isExpired(invite, now) || isFull(invite))) return false;
    if (filters.availability === "full" && !isFull(invite)) return false;
    if (filters.availability === "expired" && !isExpired(invite, now)) return false;
    if (!query) return true;
    return [invite.code, invite.label, invite.active ? "active" : "inactive"].join(" ").toLowerCase().includes(query);
  });
}

function sortInvites(invites: InviteCode[], sort: Filters["sort"]): InviteCode[] {
  return [...invites].sort((a, b) => {
    if (sort === "code") return a.code.localeCompare(b.code);
    if (sort === "status") return Number(b.active) - Number(a.active) || a.code.localeCompare(b.code);
    if (sort === "uses") return b.usedCount - a.usedCount;
    if (sort === "expiry") return (a.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.expiresAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
    return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
  });
}

function isFull(invite: InviteCode): boolean {
  return invite.maxUses !== null && invite.usedCount >= invite.maxUses;
}

function isExpired(invite: InviteCode, now: number): boolean {
  return Boolean(invite.expiresAt && invite.expiresAt.getTime() < now);
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
            {option === "all" ? `All ${label.toLowerCase()}` : option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
