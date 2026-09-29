// Campus Allemagne — canonical website logo renderer.
// Both assets below are crops of the exact approved master artwork supplied by the brand owner.
import Image from "next/image";

type BrandLogoProps = {
  variant?: "primary" | "reverse";
  symbolOnly?: boolean;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  symbolOnly = false,
  className = "",
  priority = false,
}: BrandLogoProps) {
  const src = symbolOnly
    ? "/brand/campus-allemagne-symbol-approved.png"
    : "/brand/campus-allemagne-logo-approved.png";

  return (
    <Image
      src={src}
      alt="Campus Allemagne"
      width={symbolOnly ? 192 : 400}
      height={symbolOnly ? 136 : 103}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
