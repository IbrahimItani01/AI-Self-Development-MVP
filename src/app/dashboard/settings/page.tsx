import { Card, SectionTitle } from "@/components/ui/card";
import { Badge, statusTone } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function SettingsPage() {
  const { organization } = await requireAdmin();
  return (
    <div className="space-y-6">
      <SectionTitle title="Settings" description="Organization settings and V1 placeholders." />
      <Card>
        <h2 className="font-semibold">Organization</h2>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <Row label="Name" value={organization.name} />
          <Row label="Slug" value={organization.slug} />
          <Row label="Plan" value={organization.plan} />
          <Row label="Max students" value={String(organization.maxStudents)} />
          <div className="rounded-md bg-sand px-4 py-3">
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
