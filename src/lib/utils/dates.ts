import { formatDistanceToNow, startOfWeek } from "date-fns";

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate() as Date;
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export function formatShortDate(date?: Date | null): string {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function formatRelative(date?: Date | null): string {
  if (!date) return "No activity yet";
  return `${formatDistanceToNow(date)} ago`;
}

export function currentWeekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

export function monthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
