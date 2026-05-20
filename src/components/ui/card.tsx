import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-ink/10 bg-surface p-5 shadow-soft", className)} {...props} />;
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {description ? <p className="mt-1 text-sm text-ink/60">{description}</p> : null}
    </div>
  );
}
