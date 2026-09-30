import { redirect, notFound } from "next/navigation";
import { OrientationClaimCard } from "@/components/orientation/OrientationClaimCard";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { resolveOrientationActivation } from "@/lib/orientation/account-activation";
import { isPhase2AccountLinkingEnabled } from "@/lib/phase2/config";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function OrientationClaimPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  if (!isPhase2AccountLinkingEnabled()) notFound();

  const { token } = await params;
  const activation = await resolveOrientationActivation(token);
  if (!activation) notFound();

  const { user } = await getAuthenticatedUser();
  if (!user) {
    redirect(`/signup?orientation_token=${encodeURIComponent(token)}`);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-6">
      <OrientationClaimCard token={token} />
    </main>
  );
}
