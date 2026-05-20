"use client";

import { DeleteOrganizationForm } from "@/components/dashboard/delete-organization-form";
import { Card, SectionTitle } from "@/components/ui/card";
import { Badge, statusTone } from "@/components/ui/badge";
import { useAppSelector } from "@/lib/redux/hooks";
import { selectPlanByOrganization } from "@/lib/redux/selectors";
import { subscriptionPlanDisplayName } from "@/lib/utils/plans";
import { deleteOrganizationFromDashboard } from "@/app/dashboard/settings/actions";

export function SettingsPage() {
  const organization = useAppSelector((state) => state.dashboard.organization);
  const plan = useAppSelector(selectPlanByOrganization);

  if (!organization) return null;

  const planName = subscriptionPlanDisplayName(plan, organization.plan);

  return (
    <div className="space-y-6">
      <SectionTitle title="Settings" description="Organization settings and V1 placeholders." />
      <Card>
        <h2 className="font-semibold">Organization</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Row label="Name" value={organization.name} />
          <Row label="Slug" value={organization.slug} />
          <Row label="Plan" value={planName} />
          <Row label="Max students" value={String(organization.maxStudents)} />
          <div className="rounded-md bg-canvas px-4 py-3">
            <dt className="text-ink/50">Status</dt>
            <dd className="mt-1"><Badge tone={statusTone(organization.status)}>{organization.status}</Badge></dd>
          </div>
          <Row label="Invite defaults" value="Manual code, optional max uses and expiry" />
        </dl>
      </Card>
      <Card>
        <h2 className="font-semibold">AI settings</h2>
        <p className="mt-3 text-sm text-ink/60">
          V1 uses the configured AI provider and model from environment variables. Monthly usage limits can be enforced in the usage service before future AI calls.
        </p>
      </Card>
      <Card className="border-danger/25">
        <h2 className="font-semibold text-danger">Delete organization account</h2>
        <p className="mt-3 text-sm text-ink/60">
          This permanently removes the organization, admin mapping, invite codes, students, onboarding, growth plans,
          conversations, messages, check-ins, follow-up flags, bot sessions, and usage logs. A minimal anonymized deletion
          event is retained for product-owner aggregate insights.
        </p>
        {organization.stripeCustomerId ? (
          <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
            The linked Stripe customer will be deleted after any subscription is canceled.
          </p>
        ) : null}
        <DeleteOrganizationForm organizationName={organization.name} action={deleteOrganizationFromDashboard} />
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-canvas px-4 py-3">
      <dt className="text-ink/50">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
