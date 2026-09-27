import Image from "next/image";

type BrandLogoProps = {
  variant?: "primary" | "reverse";
  symbolOnly?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  variant = "primary",
  symbolOnly = false,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const src = symbolOnly
    ? variant === "reverse"
      ? "/brand/almago-symbol-reverse.svg"
      : "/brand/almago-symbol.svg"
    : variant === "reverse"
      ? "/brand/almago-logo-reverse.svg"
      : "/brand/almago-logo.svg";

  return (
    <Image
      src={src}
      alt="AlmaGo"
      width={symbolOnly ? 540 : 1410}
      height={514}
      priority={priority}
      className={className}
    />
  );
}
