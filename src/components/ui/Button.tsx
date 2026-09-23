import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = {
  primary: "border border-transparent bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-strong)]",
  secondary: "border border-[var(--border)] bg-white text-slate-900 shadow-sm hover:border-[var(--border-strong)] hover:bg-slate-50",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-5 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-55 ${buttonVariants[variant]} ${className}`;
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
