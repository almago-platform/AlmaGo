import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClassName, type ButtonVariant } from "@/components/ui/Button";

export function ButtonLink({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  return <Link href={href} className={buttonClassName(variant, className)}>{children}</Link>;
}
