import { Card } from "@/components/ui/card";

export function StatCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <Card>
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      {helper ? <p className="mt-2 text-xs text-ink/50">{helper}</p> : null}
    </Card>
  );
}
