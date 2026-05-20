import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { CheckoutButton } from "@/components/dashboard/checkout-button";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { listActiveSubscriptionPlans } from "@/lib/db/plans";
import { formatCurrency } from "@/lib/utils/money";

export default async function RegisterPlanPage() {
  const { organization } = await requireAdmin();
  if (organization.status === "active" || organization.status === "trial") redirect("/dashboard");
  const plans = await listActiveSubscriptionPlans();

  return (
    <main className="min-h-screen bg-canvas px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-ink">Choose your plan</h1>
            <p className="mt-2 text-sm text-ink/60">
              {organization.name} is created. Complete payment to activate dashboard and student bot access.
            </p>
          </div>
          <Badge tone={statusTone(organization.status)}>{organization.status}</Badge>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {plans.length ? plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{plan.description}</p>
                </div>
                <Badge tone="good">Annual</Badge>
              </div>
              <p className="mt-6 text-4xl font-semibold">{formatCurrency(plan.annualPriceCents / 100)}</p>
              <p className="mt-1 text-sm text-ink/50">per school year</p>

              <div className="mt-6 grid gap-3 text-sm">
                <Limit label="Student seats" value={plan.studentLimit.toLocaleString()} />
                <Limit label="Monthly AI token limit" value={plan.monthlyTokenLimit.toLocaleString()} />
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm text-ink/70">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <CheckoutButton organizationId={organization.id} planId={plan.id} />
              </div>
            </Card>
          )) : (
            <Card>
              <h2 className="font-semibold">No active plans configured</h2>
              <p className="mt-2 text-sm text-ink/60">Create a subscription plan document in Firestore before accepting registrations.</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function Limit({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-canvas px-4 py-3">
      <span className="text-ink/60">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
