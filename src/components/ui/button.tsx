import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const styles =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-wine/30 disabled:pointer-events-none disabled:opacity-50";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(styles, "bg-wine text-white hover:bg-plum", className)} {...props} />;
}

export function SecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(styles, "border border-ink/10 bg-white text-ink hover:bg-sand", className)} {...props} />;
}

export function LinkButton({
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={cn(styles, "bg-wine text-white hover:bg-plum", className)} {...props} />;
}

export function GhostLink({
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <Link href={href} className={cn(styles, "border border-ink/10 bg-white text-ink hover:bg-sand", className)} {...props} />;
}
