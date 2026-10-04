import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const foundation = read("supabase/migrations/0049_campus_allemagne_procedure_foundation.sql");
const generator = read("supabase/migrations/0050_campus_allemagne_procedure_generator.sql");
const intake = read("supabase/migrations/0051_campus_intake_orientation_route_confirmation.sql");
const commercialBridge = read("supabase/migrations/20261004201000_proposal_payment_activation_bridge.sql");
const recovery = read("src/lib/orientation/recovery.ts");
const publicOrientationRoute = read("src/app/api/orientation/prospect/route.ts");
const orientationPage = read("src/app/orientation/page.tsx");
const orientationForm = read("src/components/orientation/PublicOrientationForm.tsx");
const prospectPage = read("src/app/prospect/page.tsx");
const prospectHub = read("src/lib/prospect/hub.ts");
const prospectProposalPage = read("src/app/prospect/proposal/page.tsx");
const prospectIntake = read("src/lib/prospect/intake.ts");
const intakeCard = read("src/components/prospect/IntakeFlowCard.tsx");
const starterPanel = read("src/components/prospect/StarterDocumentsPanel.tsx");
const prospectUpload = read("src/app/api/prospect/documents/upload/route.ts");
const adminPage = read("src/app/admin/intake/page.tsx");
const adminPanel = read("src/components/admin/AdminIntakePanel.tsx");
const adminRoute = read("src/app/api/admin/intake/[studentId]/route.ts");

test("focused intake keeps orientation separate from Campus route decision", () => {
  assert.match(intake, /create table if not exists public\.student_intake_cases/i);
  assert.match(intake, /orientation_id uuid not null references public\.orientations/i);
  assert.match(intake, /proposed_route_key text/i);
  assert.match(intake, /proposal_reason text/i);
  assert.match(intake, /student_response text/i);

  assert.doesNotMatch(publicOrientationRoute, /proposed_route_key|study_preparation/);
  assert.match(adminRoute, /service_admin_propose_student_route/);
  assert.match(adminPanel, /Proposition Campus Allemagne/);
  assert.match(adminPanel, /<option value="">Choisir un parcours<\/option>/);
  assert.doesNotMatch(adminPanel, /\|\| "study_preparation"/);
});

test("old orientation is recoverable by the verified account email without depending on resume-token expiry", () => {
  assert.match(intake, /service_claim_prospect_by_verified_email/i);
  assert.match(intake, /from auth\.users u/i);
  assert.match(intake, /u\.email_confirmed_at is not null/i);
  assert.match(intake, /lower\(u\.email\) = lower\(btrim\(p_user_email\)\)/i);
  assert.match(intake, /service_recover_and_confirm_latest_orientation/i);

  const recoverFunction = intake.slice(
    intake.indexOf("create or replace function public.service_recover_and_confirm_latest_orientation"),
    intake.indexOf("create or replace function public.service_admin_propose_student_route"),
  );
  assert.doesNotMatch(recoverFunction, /resume_token_expires_at|resume_token_hash/i);

  assert.match(recovery, /findRecoverableOrientationForAccount/);
  assert.match(recovery, /\.ilike\("email", email\.trim\(\)\.toLowerCase\(\)\)/);
  assert.match(intakeCard, /Nous avons retrouvé votre orientation/);
  assert.match(intakeCard, /Oui, continuer avec cette orientation/);
});

test("account-first orientation reuses account identity and links matching verified email", () => {
  assert.match(orientationPage, /authenticatedProspect/);
  assert.match(orientationPage, /initialIdentity=\{initialIdentity\}/);
  assert.match(orientationPage, /authenticatedEntry/);
  assert.match(
    orientationPage,
    /accountLinkingEnabled=\{isPhase2AccountLinkingEnabled\(\)\}/,
  );
  assert.match(publicOrientationRoute, /getAuthenticatedUser/);
  assert.match(publicOrientationRoute, /authenticatedUser\.email\.trim\(\)\.toLowerCase\(\) === email/);
  assert.match(publicOrientationRoute, /service_claim_prospect_by_verified_email/);
  assert.match(orientationForm, /readOnly=\{authenticatedEntry\}/);
  assert.match(orientationForm, /authenticatedEntry[\s\S]*sessionStorage\.removeItem\(SESSION_KEY\)/);
});

test("starter evidence burden is exactly passport, Bac, transcript plus optional existing language proof", () => {
  const requiredFunction = intake.slice(
    intake.indexOf("create or replace function private.intake_has_approved_starter_documents"),
    intake.indexOf("create or replace function private.sync_student_intake_document_state"),
  );

  assert.match(requiredFunction, /category = 'passport'/);
  assert.match(requiredFunction, /category = 'baccalaureate'/);
  assert.match(requiredFunction, /category = 'transcripts'/);
  assert.doesNotMatch(requiredFunction, /language_certificate/);

  assert.match(starterPanel, /Le certificat de langue est facultatif/);
  assert.match(starterPanel, /Facultatif si vous l’avez déjà/);
  assert.match(prospectUpload, /starterDocumentCategories/);
  assert.match(prospectUpload, /allowedStarterCategories\.has\(category\)/);
});

test("post-Bac academic proposals require starter documents while pre-Bac preparation stays available", () => {
  assert.match(commercialBridge, /v_pre_bac boolean/i);
  assert.match(
    commercialBridge,
    /if coalesce\(v_pre_bac, false\) then[\s\S]*p_route_key not in \('study_preparation', 'standalone_language'\)/i,
  );
  assert.match(
    commercialBridge,
    /elsif not private\.intake_has_approved_starter_documents\(p_student_id\) then[\s\S]*starter_documents_not_approved/i,
  );
  assert.match(adminRoute, /starter_documents_not_approved/);
  assert.match(adminRoute, /pre_bac_route_not_supported/);
  assert.match(adminPanel, /Avant le Bac[\s\S]*Préparation aux études[\s\S]*Langue seule/i);
  assert.match(commercialBridge, /proposal_reason_required/);
});

test("student acceptance starts payment and only admin payment validation creates the procedure", () => {
  const acceptFunction = commercialBridge.slice(
    commercialBridge.indexOf("create or replace function public.service_confirm_proposed_route"),
    commercialBridge.indexOf("create or replace function private.sync_student_intake_purchase_state"),
  );

  assert.match(acceptFunction, /v_case\.status <> 'route_proposed'/);
  assert.match(acceptFunction, /begin_phase2_commercial_purchase/);
  assert.match(acceptFunction, /status = 'payment_pending'/);
  assert.match(acceptFunction, /student_response = 'confirmed'/);
  assert.doesNotMatch(acceptFunction, /create_campus_student_procedure_for_route/);

  const activationFunction = commercialBridge.slice(
    commercialBridge.indexOf("create or replace function public.activate_phase2_paid_purchase"),
  );
  assert.match(activationFunction, /paid_pending_validation/);
  assert.match(activationFunction, /payment_transactions/);
  assert.match(activationFunction, /private\.create_campus_student_procedure_for_route/);
  assert.match(activationFunction, /status = 'procedure_created'/);
  assert.match(activationFunction, /status = 'client_active'/);

  assert.match(intakeCard, /Accepter et passer au paiement/);
  assert.match(intakeCard, /Je souhaite en discuter/);
});

test("post-payment activation maps study preparation to the existing project path", () => {
  assert.match(
    commercialBridge,
    /when 'study_preparation' then 'german_preparation_and_studies'::public\.student_project_path/i,
  );
  assert.match(commercialBridge, /insert into public\.student_projects/i);
  assert.match(commercialBridge, /on conflict \(student_id\) do update/i);
  assert.match(generator, /'study_preparation', 1, 'Préparation aux études'/);
  assert.match(generator, /create_campus_student_procedure_for_route/i);
  assert.match(foundation, /create table if not exists public\.student_procedures/i);
});

test("student and admin surfaces project the same intake truth", () => {
  assert.match(prospectPage, /loadProspectHubState/);
  assert.match(prospectHub, /loadProspectIntakeState/);
  assert.match(prospectProposalPage, /<IntakeFlowCard/);
  assert.doesNotMatch(prospectPage, /from\("documents"\)/);
  assert.match(prospectIntake, /from\("student_intake_cases"\)/);
  assert.match(prospectIntake, /from\("documents"\)/);
  assert.match(intakeCard, /Campus Allemagne analyse maintenant votre orientation et vos preuves/);

  assert.match(adminPage, /from\("student_intake_cases"\)/);
  assert.match(adminPage, /from\("orientations"\)/);
  assert.match(adminPage, /from\("documents"\)/);
  assert.match(adminPanel, /Orientation confirmée/);
  assert.match(adminPanel, /Pièces de départ/);
});

test("focused phase deliberately stops after procedure creation", () => {
  const focusedIntake = intake.toLowerCase();

  assert.doesNotMatch(focusedIntake, /blocked_account|health_insurance|visa_appointment/);
  assert.match(intakeCard, /Les étapes détaillées de la procédure seront traitées dans la phase suivante/);
});
