import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthMobileHeader } from "@/components/auth/AuthMobileHeader";
import { AuthStoryPanel } from "@/components/auth/AuthStoryPanel";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="auth-page min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_48%,#f1ece4_100%)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="auth-page-grid mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-7xl items-center gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-10">
        <AuthStoryPanel mode="login" />

        <section className="auth-form-shell mx-auto w-full max-w-[36rem]">
          <AuthMobileHeader mode="login" />
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
