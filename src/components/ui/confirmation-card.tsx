"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Button, SecondaryButton } from "@/components/ui/button";

type ConfirmationCardProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationCard({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  pending = false,
  onCancel,
  onConfirm,
}: ConfirmationCardProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open, pending]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close confirmation"
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm animate-confirmation-backdrop"
        onClick={() => {
          if (!pending) onCancel();
        }}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-md rounded-lg border border-danger/20 bg-surface p-5 shadow-soft animate-confirmation-card"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-danger/10 text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            <p id={descriptionId} className="mt-2 text-sm leading-6 text-ink/70">
              {description}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-ink/40 transition hover:bg-canvas hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Close"
            disabled={pending}
            onClick={onCancel}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <SecondaryButton ref={cancelButtonRef} type="button" disabled={pending} onClick={onCancel}>
            {cancelLabel}
          </SecondaryButton>
          <Button type="button" className="bg-danger hover:bg-danger/90" disabled={pending} loading={pending} loadingText="Working..." onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
