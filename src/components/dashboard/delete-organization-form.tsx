"use client";

import { useActionState, useState } from "react";
import { SecondaryButton } from "@/components/ui/button";
import type { DeleteOrganizationState } from "@/app/dashboard/settings/actions";

export function DeleteOrganizationForm({
  organizationName,
  action,
}: {
  organizationName: string;
  action: (previousState: DeleteOrganizationState, formData: FormData) => Promise<DeleteOrganizationState>;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [state, formAction, pending] = useActionState(action, { error: null });
  const confirmed = confirmation === organizationName;

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <label className="block text-sm font-medium text-ink">
        Type the organization name to confirm
        <input
          className="mt-1 w-full rounded-md border border-red-200 px-3 py-2 outline-none focus:border-red-500"
          name="confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder={organizationName}
          autoComplete="off"
          required
        />
      </label>
      <SecondaryButton
        type="submit"
        disabled={!confirmed || pending}
        className="border-red-200 text-red-700 hover:bg-red-50"
        onClick={(event) => {
          if (!confirmed) {
            event.preventDefault();
            return;
          }
          const shouldDelete = window.confirm(
            "Delete this organization account, admin login, students, bot data, invite codes, usage logs, and dashboard data? This cannot be undone.",
          );
          if (!shouldDelete) event.preventDefault();
        }}
      >
        {pending ? "Deleting..." : "Delete organization account"}
      </SecondaryButton>
      {state.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}
