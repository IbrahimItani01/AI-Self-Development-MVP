import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const styles =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:pointer-events-none disabled:opacity-50";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ className, ...props }, ref) {
    return <button ref={ref} className={cn(styles, "bg-primary text-white hover:bg-primaryDark", className)} {...props} />;
  },
);

export const SecondaryButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function SecondaryButton({ className, ...props }, ref) {
    return <button ref={ref} className={cn(styles, "border border-ink/10 bg-surface text-ink hover:bg-canvas", className)} {...props} />;
  },
);

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
