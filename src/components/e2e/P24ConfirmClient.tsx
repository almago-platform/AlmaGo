"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProofType = "signup" | "recovery";

export function P24ConfirmClient({
  tokenHash,
  type,
  next,
}: {
  tokenHash: string;
  type: ProofType;
  next: string;
}) {
  const started = useRef(false);
  const [status, setStatus] = useState<"working" | "error">("working");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        setStatus("error");
        return;
      }

      window.location.replace(next);
    })();
  }, [next, tokenHash, type]);

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p data-p24-confirm-status={status} role={status === "error" ? "alert" : "status"}>
        {status === "error" ? "Proof verification failed." : "Verifying proof session…"}
      </p>
    </main>
  );
}
