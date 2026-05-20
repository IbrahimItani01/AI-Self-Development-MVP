import { revalidatePath } from "next/cache";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button, SecondaryButton } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createInviteCode, listInviteCodes, updateInviteCode } from "@/lib/db/invites";
import { formatShortDate } from "@/lib/utils/dates";

async function createInvite(formData: FormData) {
  "use server";
  const { organization } = await requireAdmin();
  const label = String(formData.get("label") || "Student invite");
  const maxUsesValue = String(formData.get("maxUses") || "");
  const expiresAtValue = String(formData.get("expiresAt") || "");
  await createInviteCode({
    organizationId: organization.id,
    organizationName: organization.name || organization.slug,
    label,
    maxUses: maxUsesValue ? Number(maxUsesValue) : null,
    expiresAt: expiresAtValue ? new Date(expiresAtValue) : null,
  });
  revalidatePath("/dashboard/invites");
}

async function setInviteActive(formData: FormData) {
  "use server";
  const { organization } = await requireAdmin();
  await updateInviteCode(String(formData.get("inviteId")), organization.id, {
    active: String(formData.get("active")) === "true",
  });
  revalidatePath("/dashboard/invites");
}

export default async function InvitesPage() {
  const { organization } = await requireAdmin();
  const invites = await listInviteCodes(organization.id);

  return (
    <div className="space-y-6">
      <SectionTitle title="Invite Codes" description="Generate unique school invite codes students can use in Telegram." />
      <Card>
        <form action={createInvite} className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-medium">
            Label
            <input name="label" className="mt-1 w-full rounded-md border border-ink/10 px-3 py-2" placeholder="Grade 10 pilot" />
          </label>
          <label className="text-sm font-medium">
            Max uses
            <input name="maxUses" type="number" min="1" className="mt-1 w-full rounded-md border border-ink/10 px-3 py-2" placeholder="50" />
          </label>
          <label className="text-sm font-medium">
            Expiry
            <input name="expiresAt" type="date" className="mt-1 w-full rounded-md border border-ink/10 px-3 py-2" />
          </label>
          <div className="flex items-end">
            <Button className="w-full">Generate invite</Button>
          </div>
        </form>
      </Card>

      {invites.length === 0 ? (
        <EmptyState title="No invite codes" description="Generate one invite code for students to join your school bot flow." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-ink/10 bg-surface shadow-soft">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-canvas text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {invites.map((invite) => (
                <tr key={invite.id}>
                  <td className="px-4 py-3 font-semibold text-primary">{invite.code}</td>
                  <td className="px-4 py-3">{invite.label}</td>
                  <td className="px-4 py-3">{invite.usedCount} / {invite.maxUses ?? "Unlimited"}</td>
                  <td className="px-4 py-3">{formatShortDate(invite.expiresAt)}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone(invite.active ? "active" : "inactive")}>{invite.active ? "active" : "inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    <form action={setInviteActive}>
                      <input type="hidden" name="inviteId" value={invite.id} />
                      <input type="hidden" name="active" value={String(!invite.active)} />
                      <SecondaryButton>{invite.active ? "Deactivate" : "Activate"}</SecondaryButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
