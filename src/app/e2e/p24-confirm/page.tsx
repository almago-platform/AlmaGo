import { notFound } from "next/navigation";
import { P24ConfirmClient } from "@/components/e2e/P24ConfirmClient";
import { isPhase2P24E2EProof } from "@/lib/phase2/config";

export const metadata = {
  robots: { index: false, follow: false },
};

function safeNextPath(value: string | undefined) {
  if (!value) return "/prospect";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/prospect";
  }
  return value;
}

export default async function P24ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
}) {
  if (!isPhase2P24E2EProof()) notFound();

  const params = await searchParams;
  const tokenHash = params.token_hash;
  const type = params.type;

  if (!tokenHash || (type !== "signup" && type !== "recovery")) {
    notFound();
  }

  return (
    <P24ConfirmClient
      tokenHash={tokenHash}
      type={type}
      next={safeNextPath(params.next)}
    />
  );
}
