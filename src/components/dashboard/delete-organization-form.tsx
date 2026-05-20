"use client";

import { useActionState, useRef, useState } from "react";
import { SecondaryButton } from "@/components/ui/button";
import { ConfirmationCard } from "@/components/ui/confirmation-card";
import type { DeleteOrganizationState } from "@/app/dashboard/settings/actions";

export function DeleteOrganizationForm({
  organizationName,
  action,
}: {
  organizationName: string;
  action: (previousState: DeleteOrganizationState, formData: FormData) => Promise<DeleteOrganizationState>;
}) {
  const [confirmation, setConfirmation] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [state, formAction, pending] = useActionState(action, { error: null });
  const allowSubmitRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmed = confirmation === organizationName;

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="mt-5 space-y-4"
        onSubmit={(event) => {
          if (!confirmed) {
            event.preventDefault();
            return;
          }
          if (!allowSubmitRef.current) {
            event.preventDefault();
            setConfirmingDelete(true);
            return;
          }
          allowSubmitRef.current = false;
        }}
      >
        <label className="block text-sm font-medium text-ink">
          Type the organization name to confirm
          <input
            className="mt-1 w-full rounded-md border border-danger/25 px-3 py-2 outline-none focus:border-danger"
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
          className="border-danger/25 text-danger hover:bg-danger/10"
        >
          {pending ? "Deleting..." : "Delete organization account"}
        </SecondaryButton>
        {state.error ? <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p> : null}
      </form>
      <ConfirmationCard
        open={confirmingDelete}
        title="Delete organization account?"
        description="This removes the organization account, admin login, students, bot data, invite codes, usage logs, and dashboard data. This cannot be undone."
        confirmLabel="Delete organization"
        pending={pending}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => {
          allowSubmitRef.current = true;
          setConfirmingDelete(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
