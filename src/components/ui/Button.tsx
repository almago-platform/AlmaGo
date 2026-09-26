import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = {
  primary: "border border-transparent bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-strong)] active:bg-[var(--brand-strong)] disabled:bg-[var(--brand)] disabled:text-white",
  secondary: "border border-[var(--border-strong)] bg-white text-slate-800 shadow-none hover:border-[var(--brand)] hover:text-[var(--brand)] active:bg-slate-50 disabled:border-[var(--border)] disabled:bg-white disabled:text-slate-500",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-5 py-2.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${buttonVariants[variant]} ${className}`;
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
