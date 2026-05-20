import Link from "next/link";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getDashboardOverview } from "@/lib/db/organizations";
import { getSubscriptionPlan } from "@/lib/db/plans";
import { formatCurrency } from "@/lib/utils/money";
import { subscriptionPlanDisplayName } from "@/lib/utils/plans";

export default async function DashboardPage() {
  const { organization } = await requireAdmin();
  const [overview, plan] = await Promise.all([
    getDashboardOverview(organization.id),
    getSubscriptionPlan(organization.plan),
  ]);
  const planName = subscriptionPlanDisplayName(plan, overview.organization.plan);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionTitle title="Overview" description="School engagement, subscription access, and support signals." />
        <Badge tone={statusTone(overview.organization.status)}>{overview.organization.status}</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total students" value={overview.totalStudents} helper={`${overview.activeStudents} active`} />
        <StatCard label="Inactive students" value={overview.inactiveStudents} />
        <StatCard label="Open follow-ups" value={overview.openFollowUps} helper="May benefit from human review" />
        <StatCard label="Check-ins this month" value={overview.weeklyCheckIns} />
        <StatCard label="AI tokens this month" value={overview.monthlyTokens.toLocaleString()} />
        <StatCard label="Estimated AI cost" value={formatCurrency(overview.monthlyEstimatedCost)} />
        <StatCard label="Plan" value={planName} helper={`${overview.organization.maxStudents} student limit`} />
        <StatCard label="Access status" value={overview.organization.status} />
      </div>
      <Card>
        <h2 className="text-lg font-semibold">Demo flow</h2>
        <div className="mt-4 grid gap-3 text-sm text-ink/70 md:grid-cols-3">
          <Link className="rounded-md border border-ink/10 p-4 hover:bg-canvas" href="/dashboard/invites">
            Create or share invite code
          </Link>
          <Link className="rounded-md border border-ink/10 p-4 hover:bg-canvas" href="/dashboard/check-ins">
            Review check-ins
          </Link>
          <Link className="rounded-md border border-ink/10 p-4 hover:bg-canvas" href="/dashboard/follow-ups">
            Manage follow-up flags
          </Link>
        </div>
      </Card>
    </div>
  );
}
