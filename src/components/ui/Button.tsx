import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = {
  primary: "bg-[var(--brand)] text-white shadow-sm hover:bg-[var(--brand-strong)]",
  secondary: "border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${className}`;
}

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}
