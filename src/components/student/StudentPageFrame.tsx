import type { ReactNode } from "react";

export function StudentPageFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8 ${className}`}
    >
      {children}
    </main>
  );
}
