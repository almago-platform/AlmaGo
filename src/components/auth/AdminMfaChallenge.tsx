"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type Enrolment = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export function AdminMfaChallenge() {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [unverifiedFactorIds, setUnverifiedFactorIds] = useState<string[]>([]);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let active = true;

    void (async () => {
      const supabase = createClient();
      const { data, error: factorError } = await supabase.auth.mfa.listFactors();

      if (!active) return;
      if (factorError) {
        setError("Impossible de charger les facteurs de sécurité.");
        setLoading(false);
        return;
      }

      const verified = data.totp.find((factor) => factor.status === "verified");
      setFactorId(verified?.id ?? null);
      setUnverifiedFactorIds(
        data.all
          .filter(
            (factor) =>
              factor.factor_type === "totp" && factor.status === "unverified",
          )
          .map((factor) => factor.id),
      );
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, []);

  async function startEnrolment() {
    setLoading(true);
    setError("");
    const supabase = createClient();

    for (const pendingFactorId of unverifiedFactorIds) {
      await supabase.auth.mfa.unenroll({ factorId: pendingFactorId });
    }

    const { data, error: enrolError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "AlmaGo Admin",
    });

    if (enrolError) {
      setError("Impossible de démarrer l’activation MFA.");
      setLoading(false);
      return;
    }

    setFactorId(data.id);
    setEnrolment({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setLoading(false);
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const activeFactorId = enrolment?.factorId ?? factorId;
    if (!activeFactorId || !/^\d{6}$/.test(code)) {
      setError("Saisissez le code à six chiffres de votre application.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: activeFactorId,
      code,
    });

    if (verifyError) {
      setError("Code incorrect ou expiré. Demandez un nouveau code et réessayez.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  if (loading && !factorId && !enrolment) {
    return <p className="mt-6 text-sm text-[var(--muted)]">Vérification en cours…</p>;
  }

  if (!factorId && !enrolment) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Aucun facteur vérifié n’est associé à ce compte administrateur.
        </p>
        {error ? <p role="alert" className="text-sm font-medium text-[var(--danger)]">{error}</p> : null}
        <Button onClick={startEnrolment} isLoading={loading}>
          Configurer une application d’authentification
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={verify} className="mt-6 space-y-5">
      {enrolment ? (
        <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
          <p className="text-sm font-semibold">Scannez ce QR code une seule fois.</p>
          <Image
            src={enrolment.qrCode}
            alt="QR code TOTP AlmaGo"
            width={220}
            height={220}
            unoptimized
            className="mx-auto mt-4"
          />
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            Saisie manuelle : <code className="break-all font-mono text-[var(--foreground)]">{enrolment.secret}</code>
          </p>
        </div>
      ) : null}

      <label className="block text-sm font-semibold">
        Code temporaire
        <input
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          className="field mt-2 min-h-12 text-left font-mono tracking-[0.25em]"
        />
      </label>
      {error ? <p role="alert" className="text-sm font-medium text-[var(--danger)]">{error}</p> : null}
      <Button type="submit" isLoading={loading} disabled={code.length !== 6}>
        Vérifier et ouvrir le cockpit
      </Button>
    </form>
  );
}
