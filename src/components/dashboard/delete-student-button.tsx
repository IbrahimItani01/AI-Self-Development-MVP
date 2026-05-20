"use client";

import { useRef, useState } from "react";
import { SecondaryButton } from "@/components/ui/button";
import { ConfirmationCard } from "@/components/ui/confirmation-card";

export function DeleteStudentButton({ studentName }: { studentName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <SecondaryButton
        type="button"
        className="border-danger/25 text-danger hover:bg-danger/10"
        loading={deleting}
        loadingText="Deleting..."
        onClick={(event) => {
          formRef.current = event.currentTarget.form;
          setConfirming(true);
        }}
      >
        Delete
      </SecondaryButton>
      <ConfirmationCard
        open={confirming}
        title={`Delete ${studentName}?`}
        description="This removes the student account, onboarding, plan, messages, check-ins, follow-up flags, bot session, and usage logs. This cannot be undone."
        confirmLabel="Delete student"
        pending={deleting}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setDeleting(true);
          setConfirming(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
