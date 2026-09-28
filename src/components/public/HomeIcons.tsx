import type { ReactNode } from "react";

const paths = {
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  external: (
    <>
      <path d="M14 4h6v6m0-6L9 15" />
      <path d="M10 4H4v16h16v-6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  route: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="19" r="2" />
      <path d="M8 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7" />
    </>
  ),
  folder: <path d="M3 7V5h6l2 2h10v13H3Zm0 3h18" />,
  book: (
    <path d="M12 5v15m0-15C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z" />
  ),
  source: (
    <>
      <path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z" />
      <path d="m8 11 3 3 5-5" />
    </>
  ),
  document: (
    <>
      <path d="M5 3h9l5 5v13H5Zm9 0v6h5M8 13h8M8 17h6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  certificate: (
    <>
      <path d="M5 3h10l4 4v9H5Z" />
      <path d="M15 3v5h4M8 9h6M8 12h5" />
      <circle cx="16.5" cy="17.5" r="3.5" />
      <path d="m14.5 20.2-.5 2.3 2.5-1 2.5 1-.5-2.3" />
    </>
  ),
  university: (
    <>
      <path d="m3 9 9-5 9 5v2H3Z" />
      <path d="M5 11v7M9 11v7M15 11v7M19 11v7M3 18h18v2H3Z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.2 2.1 3.2 4.8 3.2 8S14.2 17.9 12 20c-2.2-2.1-3.2-4.8-3.2-8S9.8 6.1 12 4Z" />
      <path d="m17.5 5.5 1.5-1.5M19 4h2v2" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type HomeIconName = keyof typeof paths;

export function HomeIcon({
  name,
  className,
}: {
  name: HomeIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      data-home-icon={name}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
