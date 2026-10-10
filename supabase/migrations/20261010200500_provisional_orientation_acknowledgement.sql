-- Free Prospect candidates may confirm the accuracy of their OWN saved
-- public orientation before confirming email. This is NOT a confirmed
-- Supabase intake case, academic review, client entitlement or payment.
alter table public.provisional_candidate_credentials
  add column if not exists orientation_acknowledged_at timestamptz;
