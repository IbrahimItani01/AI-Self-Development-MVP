import { BillingActions } from "@/components/dashboard/billing-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getDashboardOverview } from "@/lib/db/organizations";
import { formatShortDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/money";

export default async function BillingPage() {
  const { organization } = await requireAdmin();
  const overview = await getDashboardOverview(organization.id);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle title="Billing" description="Subscription access and usage estimate for this school." />
        <Badge tone={statusTone(organization.status)}>{organization.status}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Plan" value={organization.plan} />
        <StatCard label="Max students" value={organization.maxStudents} />
        <StatCard label="AI usage this month" value={overview.monthlyTokens.toLocaleString()} />
        <StatCard label="Estimated AI cost" value={formatCurrency(overview.monthlyEstimatedCost)} />
      </div>
      <Card>
        <h2 className="font-semibold">Subscription details</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Row label="Stripe customer" value={organization.stripeCustomerId || "Not linked"} />
          <Row label="Stripe subscription" value={organization.stripeSubscriptionId || "Not linked"} />
          <Row label="Current period end" value={formatShortDate(organization.subscriptionCurrentPeriodEnd)} />
          <Row label="Access status" value={organization.status} />
        </dl>
        <div className="mt-6">
          <BillingActions organizationId={organization.id} />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-sand px-4 py-3">
      <dt className="text-ink/50">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
