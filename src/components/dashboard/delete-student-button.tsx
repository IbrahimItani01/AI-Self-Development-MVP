"use client";

import { SecondaryButton } from "@/components/ui/button";

export function DeleteStudentButton({ studentName }: { studentName: string }) {
  return (
    <SecondaryButton
      className="border-red-200 text-red-700 hover:bg-red-50"
      onClick={(event) => {
        const confirmed = window.confirm(
          `Delete ${studentName}'s student account and saved bot data? This cannot be undone.`,
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      Delete
    </SecondaryButton>
  );
}
