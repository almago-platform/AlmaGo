import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClassName, type ButtonVariant } from "@/components/ui/Button";

export function ButtonLink({ children, href, variant = "primary" }: { children: ReactNode; href: string; variant?: ButtonVariant }) {
  return <Link href={href} className={buttonClassName(variant)}>{children}</Link>;
}
