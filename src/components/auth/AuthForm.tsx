"use client";

import Link from "next/link";
import { FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { buttonClassName } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { StudentEntryProgress } from "@/components/student/StudentEntryProgress";

type Mode = "login" | "signup" | "forgot";

type OrientationActivation = {
  token: string;
  email: string;
};

const subscribeHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function AuthForm({
  initialMode = "login",
  orientationActivation,
  partnerPrelaunch = false,
}: {
  initialMode?: Mode;
  orientationActivation?: OrientationActivation;
  partnerPrelaunch?: boolean;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState(orientationActivation?.email ?? "");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const router = useRouter();
  const { copy, locale } = useLocale();
  const auth = copy.auth;
  const restrictedAction = partnerPrelaunch && mode !== "login";
  const prelaunchNotice = locale === "ar"
    ? "هذه بيئة عرض للشركاء. إنشاء الحساب واسترجاع كلمة المرور متوقفان مؤقتًا. استخدم حساب العرض المخصص."
    : "Environnement de démonstration partenaire : création de compte et récupération de mot de passe temporairement désactivées. Utilisez le compte de démonstration fourni.";
  const activationToken = orientationActivation?.token;
  const activationClaimPath = activationToken
    ? `/orientation/claim/${encodeURIComponent(activationToken)}`
    : null;
  const loginHref = activationToken
    ? `/login?orientation_token=${encodeURIComponent(activationToken)}`
    : "/login";
  const signupHref = activationToken
    ? `/signup?orientation_token=${encodeURIComponent(activationToken)}`
    : "/signup";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (restrictedAction) {
      setError(prelaunchNotice);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "forgot") {
        const resetNext = activationToken
          ? `/reset-password?orientation_token=${encodeURIComponent(activationToken)}`
          : "/reset-password";
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(resetNext)}`,
        });
        if (resetError) setError(auth.messages.resetError);
        else setMessage(auth.messages.resetSent);
      } else if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: `${firstName} ${lastName}`.trim() },
            ...(activationClaimPath
              ? {
                  emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(activationClaimPath)}`,
                }
              : {}),
          },
        });
        if (signUpError) setError(auth.messages.signupError);
        else if (data.session) router.push(activationClaimPath ?? "/student");
        else setMessage(auth.messages.checkEmail);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) setError(auth.messages.invalidLogin);
        else router.push(activationClaimPath ?? "/student");
      }
    } catch {
      setError(auth.messages.generic);
    } finally {
      setLoading(false);
    }
  }

  const title = auth.titles[mode];
  const subtitle = auth.subtitles[mode];
  const passwordPadding = "pr-24 text-left";
  const passwordButtonSide = "right-2";

  return (
    <section className="auth-form-card w-full overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_70px_-54px_rgba(28,33,36,0.5)]">
      <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo className="hidden h-auto w-44 lg:block" />
          {mode === "signup" && (
            <span className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--brand-strong)]">
              {auth.labels.studentAccount}
            </span>
          )}
        </div>
        <h1 className="auth-form-title editorial-accent mt-2 text-[2rem] leading-[1.06] text-[var(--foreground)] sm:text-[2.2rem]">{title}</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">{subtitle}</p>
        {mode === "signup" && (
          <div className="mt-5">
            <StudentEntryProgress current={1} compact />
          </div>
        )}
      </div>

      <form onSubmit={submit} aria-busy={loading} data-auth-ready={hydrated ? "true" : "false"} className="space-y-4 px-5 py-5 sm:px-7 sm:py-6">
        {restrictedAction && (
          <p role="status" data-partner-auth-restricted="true" className="rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-950">
            {prelaunchNotice}
          </p>
        )}

        {mode === "signup" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-[var(--foreground)]">
              {auth.labels.firstName}
              <input
                required
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                placeholder={auth.placeholders.firstName}
                className="field mt-2 min-h-12"
              />
            </label>
            <label className="block text-sm font-semibold text-[var(--foreground)]">
              {auth.labels.lastName}
              <input
                required
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                placeholder={auth.placeholders.lastName}
                className="field mt-2 min-h-12"
              />
            </label>
          </div>
        )}

        <label className="block text-sm font-semibold text-[var(--foreground)]">
          {auth.labels.email}
          <input
            required
            type="email"
            dir="ltr"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            readOnly={Boolean(orientationActivation)}
            placeholder={auth.placeholders.email}
            className="field mt-2 min-h-12 text-left"
          />
        </label>

        {mode !== "forgot" && (
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            {auth.labels.password}
            <span className="relative mt-2 block">
              <input
                required
                minLength={8}
                dir="ltr"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                aria-describedby={mode === "signup" ? "signup-password-hint" : undefined}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`field mt-0 min-h-12 ${passwordPadding}`}
              />
              <button
                type="button"
                className={`absolute inset-y-0 ${passwordButtonSide} my-auto min-h-10 rounded-[var(--radius-control)] px-2 text-xs font-semibold text-[var(--brand)] hover:text-[var(--brand-strong)]`}
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? auth.labels.hide : auth.labels.show}
                aria-pressed={showPassword}
              >
                {showPassword ? auth.labels.hide : auth.labels.show}
              </button>
            </span>
          </label>
        )}

        {mode === "signup" && (
          <div id="signup-password-hint" className="grid gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-3 text-xs text-slate-600 sm:grid-cols-2">
            <span>• {auth.labels.minPassword}</span>
            <span>• {auth.labels.emailConfirmation}</span>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-[var(--radius-control)] border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-[var(--radius-control)] border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}

        <button type="submit" disabled={loading || !hydrated || restrictedAction} className={buttonClassName("primary", "w-full min-h-12 justify-center py-3 text-base")}>
          {loading
            ? auth.labels.loading
            : mode === "login"
              ? auth.labels.login
              : mode === "signup"
                ? auth.labels.signup
                : auth.labels.sendLink}
        </button>
      </form>

      <div className="flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4 text-sm font-semibold text-[var(--brand-strong)] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        {mode === "signup" ? (
          <p className="text-slate-600">
            {auth.labels.alreadyAccount}{" "}
            <Link href={loginHref} className="inline-flex min-h-11 items-center text-[var(--brand-strong)] underline decoration-current underline-offset-4 hover:text-[var(--foreground)]">
              {auth.labels.login}
            </Link>
          </p>
        ) : (
          <Link href={signupHref} className="inline-flex min-h-11 items-center text-[var(--brand-strong)] hover:text-[var(--foreground)]">
            {auth.labels.createAccount}
          </Link>
        )}
        {mode !== "signup" && (
          <button
            type="button"
            className="min-h-11 rounded-[var(--radius-control)] px-1 text-start transition-colors hover:text-[var(--brand-strong)] focus-visible:outline-none"
            onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}
          >
            {mode === "forgot" ? auth.labels.backLogin : auth.labels.forgotPassword}
          </button>
        )}
      </div>
    </section>
  );
}
