import type { ReactNode } from "react";

export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  className = "",
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="ds-label">
        {label}
        {required ? <span className="ms-1 text-[var(--brand-strong)]" aria-hidden="true">*</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-xs leading-5 text-[var(--muted)]">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={errorId} className="mt-2 text-xs font-semibold leading-5 text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldDescriptionIds(id: string, options: { hint?: boolean; error?: boolean }) {
  return [options.hint ? `${id}-hint` : null, options.error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ") || undefined;
}
