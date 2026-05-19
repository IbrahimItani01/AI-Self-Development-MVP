import { BillingActions } from "@/components/dashboard/billing-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getDashboardOverview } from "@/lib/db/organizations";
import { getSubscriptionPlan } from "@/lib/db/plans";
import { canStartCheckout } from "@/lib/stripe/server";
import { formatShortDate } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/money";

export default async function BillingPage() {
  const { organization } = await requireAdmin();
  const [overview, plan] = await Promise.all([
    getDashboardOverview(organization.id),
    getSubscriptionPlan(organization.plan),
  ]);
  const studentUsagePercent = Math.min(100, Math.round((overview.totalStudents / Math.max(organization.maxStudents, 1)) * 100));
  const monthlyTokenLimit = organization.monthlyTokenLimit ?? plan?.monthlyTokenLimit ?? 0;
  const tokenUsagePercent = monthlyTokenLimit ? Math.min(100, Math.round((overview.monthlyTokens / monthlyTokenLimit) * 100)) : 0;
  const checkoutAvailable = canStartCheckout(organization);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <SectionTitle title="Billing" description="Plan access, subscription health, and usage limits for this school." />
        <Badge tone={statusTone(organization.status)}>{organization.status}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Current plan" value={plan?.name ?? organization.plan} helper={organization.status === "active" ? "Subscription active" : "Payment required"} />
        <StatCard label="Student seats" value={`${overview.totalStudents}/${organization.maxStudents}`} helper={`${studentUsagePercent}% used`} />
        <StatCard label="AI tokens this month" value={overview.monthlyTokens.toLocaleString()} helper={monthlyTokenLimit ? `${tokenUsagePercent}% of ${monthlyTokenLimit.toLocaleString()}` : "No limit configured"} />
        <StatCard label="Estimated AI cost" value={formatCurrency(overview.monthlyEstimatedCost)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Subscription overview</h2>
              <p className="mt-2 text-sm text-ink/60">
                Billing is managed in Stripe under the organization customer account.
              </p>
            </div>
            <Badge tone={statusTone(organization.status)}>{organization.status}</Badge>
          </div>
          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <Row label="Billing customer" value={organization.name} />
            <Row label="Billing email" value={organization.billingEmail || "Not set"} />
            <Row label="Contact" value={organization.billingContactName || "Not set"} />
            <Row label="Current period ends" value={formatShortDate(organization.subscriptionCurrentPeriodEnd)} />
            <Row label="Payment provider" value={organization.stripeCustomerId ? "Stripe customer linked" : "Stripe customer not linked"} />
            <Row label="Subscription" value={organization.stripeSubscriptionId ? "Active Stripe subscription record" : "No subscription record yet"} />
          </dl>
          <div className="mt-6">
            <BillingActions
              organizationId={organization.id}
              planId={plan?.id ?? "pro"}
              canStartCheckout={checkoutAvailable}
              hasStripeCustomer={Boolean(organization.stripeCustomerId)}
            />
            {!checkoutAvailable ? (
              <p className="mt-3 text-sm text-ink/60">This organization is already on the Pro plan. Use the billing portal for receipts, payment methods, and subscription management.</p>
            ) : null}
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Plan limits</h2>
          <div className="mt-5 space-y-5">
            <UsageBar label="Student seats" value={overview.totalStudents} limit={organization.maxStudents} />
            <UsageBar label="Monthly AI tokens" value={overview.monthlyTokens} limit={monthlyTokenLimit} />
          </div>
          {plan ? (
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Included in {plan.name}</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink/65">
                {plan.features.map((feature) => <li key={feature}>- {feature}</li>)}
              </ul>
            </div>
          ) : (
            <p className="mt-6 text-sm text-red-700">The organization plan is not configured in Firestore.</p>
          )}
        </Card>
      </div>
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

function UsageBar({ label, value, limit }: { label: string; value: number; limit: number }) {
  const percent = limit ? Math.min(100, Math.round((value / limit) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-ink/60">{value.toLocaleString()} / {limit ? limit.toLocaleString() : "Not set"}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-sand">
        <div className="h-2 rounded-full bg-wine" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
