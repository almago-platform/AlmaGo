// Campus Allemagne — canonical website logo renderer.
// The full lockup uses the exact approved master artwork supplied by the brand owner.
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
      ? "/brand/campus-allemagne-symbol-reverse.svg"
      : "/brand/campus-allemagne-symbol.svg"
    : "/brand/campus-allemagne-logo-approved.webp";

  return (
    <Image
      src={src}
      alt="Campus Allemagne"
      width={symbolOnly ? 520 : 420}
      height={symbolOnly ? 420 : 106}
      priority={priority}
      unoptimized={!symbolOnly}
      className={className}
    />
  );
}
