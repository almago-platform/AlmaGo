import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getAuthenticatedUser } from "@/lib/auth/access";
import { hasVerifiedEmail } from "@/lib/auth/verified";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { AuthStoryPanel } from "@/components/auth/AuthStoryPanel";
import { resolveOrientationActivation } from "@/lib/orientation/account-activation";
import { isPhase2AccountLinkingEnabled } from "@/lib/phase2/config";
import { isProvisionalCandidateEnabled } from "@/lib/prospect/provisional-auth";
import { isPartnerPrelaunchModeEnabled } from "@/lib/prelaunch";
import { getRequestCopy } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getRequestCopy();

  return {
    title: copy.auth.titles.signup,
    description: copy.auth.subtitles.signup,
    robots: { index: false, follow: false },
  };
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ orientation_token?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawToken = Array.isArray(params.orientation_token)
    ? params.orientation_token[0]
    : params.orientation_token;
  const partnerPrelaunch = isPartnerPrelaunchModeEnabled();
  const orientationActivation = isPhase2AccountLinkingEnabled()
    ? await resolveOrientationActivation(rawToken)
    : null;

  // An already verified candidate should claim the saved orientation with the
  // existing session, not create a second account. Only the matching email may
  // claim the token; the claim API independently enforces auth and ownership.
  if (orientationActivation) {
    const { user } = await getAuthenticatedUser();
    if (
      hasVerifiedEmail(user)
      && user?.email?.trim().toLowerCase() === orientationActivation.email
    ) {
      redirect(`/orientation/claim/${encodeURIComponent(orientationActivation.token)}`);
    }
  }

  return (
    <main className="auth-page min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_48%,#f1ece4_100%)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="auth-page-grid mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-7xl items-center gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-10">
        <AuthStoryPanel mode="signup" prospectSignup={Boolean(orientationActivation)} />

        <section className="auth-form-shell mx-auto w-full max-w-[36rem]">
          <AuthMobileHeader mode="signup" />
          <AuthForm
            initialMode="signup"
            orientationActivation={orientationActivation ?? undefined}
            partnerPrelaunch={partnerPrelaunch}
            provisionalAccessEnabled={isProvisionalCandidateEnabled()}
          />
        </section>
      </div>
    </main>
  );
}
