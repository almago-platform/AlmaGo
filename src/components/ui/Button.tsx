import type { ButtonHTMLAttributes } from "react";

export const buttonVariants = {
  primary:
    "border border-transparent bg-[var(--brand)] text-white shadow-[var(--shadow-xs)] hover:bg-[var(--brand-hover)] active:bg-[var(--brand-pressed)] disabled:bg-[var(--brand)] disabled:text-white",
  secondary:
    "border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--foreground)] shadow-[var(--shadow-xs)] hover:border-[var(--brand-border)] hover:bg-[var(--brand-subtle)] hover:text-[var(--brand-strong)] active:bg-[var(--surface-subtle)] disabled:border-[var(--border)] disabled:bg-[var(--surface-disabled)] disabled:text-[var(--muted)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--foreground-soft)] shadow-none hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] active:bg-[var(--surface-muted)] disabled:text-[var(--muted)]",
  danger:
    "border border-transparent bg-[var(--danger)] text-white shadow-[var(--shadow-xs)] hover:bg-[var(--danger-strong)] active:bg-[var(--danger-strong)] disabled:bg-[var(--danger)] disabled:text-white",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex min-h-[var(--control-height)] items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none disabled:active:translate-y-0 ${buttonVariants[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; isLoading?: boolean }) {
  return (
    <button
      type={type}
      className={buttonClassName(variant, className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <span className="ds-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
