"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { forwardRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const styles =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:pointer-events-none disabled:opacity-50";

type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
};

export const Button = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function Button({ className, children, disabled, loading = false, loadingText, ...props }, ref) {
    return (
      <button ref={ref} className={cn(styles, "bg-primary text-white hover:bg-primaryDark", className)} disabled={disabled || loading} {...props}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {loading ? loadingText || children : children}
      </button>
    );
  },
);

export const SecondaryButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function SecondaryButton({ className, children, disabled, loading = false, loadingText, ...props }, ref) {
    return (
      <button ref={ref} className={cn(styles, "border border-ink/10 bg-surface text-ink hover:bg-canvas", className)} disabled={disabled || loading} {...props}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {loading ? loadingText || children : children}
      </button>
    );
  },
);

export function FormButton({ pendingText, ...props }: LoadingButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return <Button loading={pending} loadingText={pendingText} {...props} />;
}

export function FormSecondaryButton({ pendingText, ...props }: LoadingButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return <SecondaryButton loading={pending} loadingText={pendingText} {...props} />;
}

export function LinkButton({
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={cn(styles, "bg-primary text-white hover:bg-primaryDark", className)} {...props} />;
}

export function GhostLink({
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={cn(styles, "border border-ink/10 bg-surface text-ink hover:bg-canvas", className)} {...props} />;
}
