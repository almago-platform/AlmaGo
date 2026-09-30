import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

type TransactionalEmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
};

type ResendConfiguration = {
  provider: "resend";
  apiKey: string;
  from: string;
};

export type TransactionalEmailResult =
  | { status: "sent"; provider: "resend"; messageId: string }
  | { status: "unavailable" }
  | { status: "failed" };

export function getTransactionalEmailConfiguration(
  env: Record<string, string | undefined> = process.env,
): ResendConfiguration | null {
  const provider = env.ALMAGO_TRANSACTIONAL_EMAIL_PROVIDER?.trim().toLowerCase();
  if (provider !== "resend") return null;

  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.ALMAGO_TRANSACTIONAL_EMAIL_FROM?.trim();

  if (!apiKey || !from) return null;
  return { provider: "resend", apiKey, from };
}

export async function sendTransactionalEmail(
  message: TransactionalEmailMessage,
  env: Record<string, string | undefined> = process.env,
): Promise<TransactionalEmailResult> {
  const config = getTransactionalEmailConfiguration(env);
  if (!config) return { status: "unavailable" };

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`,
        "Idempotency-Key": message.idempotencyKey,
      },
      body: JSON.stringify({
        from: config.from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!response.ok) return { status: "failed" };

    const payload = await response.json().catch(() => null) as { id?: unknown } | null;
    if (!payload || typeof payload.id !== "string" || !payload.id) {
      return { status: "failed" };
    }

    return {
      status: "sent",
      provider: "resend",
      messageId: payload.id,
    };
  } catch {
    return { status: "failed" };
  }
}
