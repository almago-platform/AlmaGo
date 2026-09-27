export type SymbolName =
  | "arrow"
  | "external"
  | "folder"
  | "document"
  | "book"
  | "route"
  | "shield"
  | "check"
  | "plus"
  | "menu"
  | "close"
  | "clock"
  | "pin";
const paths: Record<SymbolName, string> = {
  arrow: "M4 12h15M13 5l7 7-7 7",
  external:
    "M14 4h6v6M20 4l-9 9M10 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5",
  folder:
    "M3 8V5a1 1 0 0 1 1-1h6l3 3h7a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Zm0 1h18",
  document:
    "M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Zm0 0v5h5M9 12h6M9 16h6",
  book: "M12 5v16M12 5C8 2 5 3 2 4v15c3-1 6-2 10 1 4-3 7-2 10-1V4c-3-1-6-2-10 1Z",
  route:
    "M5 4h8a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h10M2 4a2 2 0 1 0 4 0 2 2 0 1 0-4 0M18 20a2 2 0 1 0 4 0 2 2 0 1 0-4 0",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4ZM8 12l3 3 5-6",
  check: "M5 12l4 4L19 6",
  plus: "M12 5v14M5 12h14",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "m6 6 12 12M6 18 18 6",
  clock: "M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  pin: "M12 22s8-8 8-13A8 8 0 0 0 4 9c0 5 8 13 8 13ZM15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
};
export function HomeSymbol({
  name,
  className,
}: {
  name: SymbolName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
