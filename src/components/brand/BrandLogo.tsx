// Campus Allemagne — canonical website logo renderer.
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
    : variant === "reverse"
      ? "/brand/campus-allemagne-logo-reverse.svg"
      : "/brand/campus-allemagne-logo.svg";

  return (
    <Image
      src={src}
      alt="Campus Allemagne"
      width={symbolOnly ? 520 : 1500}
      height={symbolOnly ? 420 : 520}
      priority={priority}
      className={className}
    />
  );
}
