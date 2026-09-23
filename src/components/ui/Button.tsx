import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = {
  primary: "border border-transparent bg-[var(--brand)] text-white shadow-[0_10px_24px_-16px_rgba(41,48,139,0.95)] hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-[0_14px_30px_-18px_rgba(41,48,139,0.9)] active:translate-y-0 active:bg-[var(--brand-strong)] disabled:bg-[var(--brand)] disabled:text-white",
  secondary: "border border-[var(--border)] bg-white text-slate-900 shadow-sm hover:-translate-y-px hover:border-[var(--brand-border)] hover:bg-white hover:shadow-md active:translate-y-0 active:bg-slate-50 disabled:border-[var(--border)] disabled:bg-white disabled:text-slate-500",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${buttonVariants[variant]} ${className}`;
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
