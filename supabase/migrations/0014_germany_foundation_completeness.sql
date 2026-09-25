-- Germany/Tunisia foundations hardening: explicit regulatory verification and complete student project context.

alter table public.regulatory_sources
  add column category text,
  add column origin_country text,
  add column destination_country text,
  add column amount numeric(12,2),
  add column currency text,
  add column periodicity text,
  add column rule_text text,
  add column verification_status text not null default 'needs_reverification',
  add column verified_at timestamptz,
  add column review_due_at timestamptz;

update public.regulatory_sources
set
  category = topic,
  origin_country = case when jurisdiction = 'DE-TN' then 'TN' else null end,
  destination_country = 'DE',
  rule_text = summary,
  verification_status = 'needs_reverification',
  verified_at = null,
  review_due_at = null;

alter table public.regulatory_sources
  alter column category set not null,
  alter column destination_country set not null,
  alter column rule_text set not null,
  add constraint regulatory_sources_origin_country_format
    check (origin_country is null or origin_country ~ '^[A-Z]{2}$'),
  add constraint regulatory_sources_destination_country_format
    check (destination_country ~ '^[A-Z]{2}$'),
  add constraint regulatory_sources_amount_nonnegative
    check (amount is null or amount >= 0),
  add constraint regulatory_sources_currency_format
    check (currency is null or currency ~ '^[A-Z]{3}$'),
  add constraint regulatory_sources_periodicity_allowed
    check (periodicity is null or periodicity in ('one_time', 'monthly', 'yearly', 'per_semester', 'other')),
  add constraint regulatory_sources_verification_status_allowed
    check (verification_status in ('verified', 'needs_reverification')),
  add constraint regulatory_sources_verified_dates_required
    check (
      verification_status <> 'verified'
      or (verified_at is not null and review_due_at is not null)
    ),
  add constraint regulatory_sources_review_after_verification
    check (
      verified_at is null
      or review_due_at is null
      or review_due_at > verified_at
    );

alter table public.student_projects
  add column current_diploma text,
  add column diploma_country text,
  add column preferred_study_language text,
  add column monthly_budget numeric(10,2),
  add column budget_currency text not null default 'EUR',
  add column actual_objective text;

alter table public.student_projects
  add constraint student_projects_current_diploma_length
    check (current_diploma is null or char_length(current_diploma) <= 160),
  add constraint student_projects_diploma_country_format
    check (diploma_country is null or diploma_country ~ '^[A-Z]{2}$'),
  add constraint student_projects_study_language_length
    check (preferred_study_language is null or char_length(preferred_study_language) <= 80),
  add constraint student_projects_monthly_budget_range
    check (monthly_budget is null or (monthly_budget >= 0 and monthly_budget <= 100000)),
  add constraint student_projects_budget_currency_eur
    check (budget_currency = 'EUR'),
  add constraint student_projects_actual_objective_length
    check (actual_objective is null or char_length(actual_objective) <= 1200);

create index regulatory_sources_verification_review_idx
  on public.regulatory_sources(verification_status, review_due_at)
  where is_active;
