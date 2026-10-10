/**
 * Authenticated is not equivalent to email-verified. Supabase anonymous sessions
 * also have the Postgres authenticated role; they must never receive Student
 * or privileged Prospect access.
 */
export function hasVerifiedEmail(user: {
  email?: string | null;
  email_confirmed_at?: string | null;
  is_anonymous?: boolean;
} | null | undefined): boolean {
  return Boolean(user?.email && user.email_confirmed_at && user.is_anonymous !== true);
}
