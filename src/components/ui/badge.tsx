import { cn } from "@/lib/utils/cn";

const toneStyles = {
  neutral: "bg-ink/5 text-ink",
  good: "bg-sage/15 text-sage",
  warn: "bg-gold/20 text-amber-800",
  danger: "bg-red-100 text-red-700",
};

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof toneStyles }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneStyles[tone])}>{children}</span>;
}

export function statusTone(status: string): keyof typeof toneStyles {
  if (["active", "trial", "reviewed", "closed"].includes(status)) return "good";
  if (["past_due", "open", "flagged"].includes(status)) return "warn";
  if (["canceled", "inactive", "high"].includes(status)) return "danger";
  return "neutral";
}
