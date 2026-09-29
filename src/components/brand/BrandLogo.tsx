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
    ? "/brand/campus-allemagne-symbol-approved.webp"
    : "/brand/campus-allemagne-logo-approved.webp";

  return (
    <Image
      src={src}
      alt="Campus Allemagne"
      width={symbolOnly ? 160 : 420}
      height={symbolOnly ? 117 : 106}
      priority={priority}
      unoptimized
      className={className}
    />
  );
}
