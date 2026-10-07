import assert from "node:assert/strict";

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

assert.ok(url, "SUPABASE_URL is required");
assert.ok(anonKey, "SUPABASE_ANON_KEY is required");
assert.ok(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY is required");

const service = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const password = `Local-only-${suffix}-Aa1!`;

async function createUser(label) {
  const email = `${label}-${suffix}@example.test`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.ifError(error);
  assert.ok(data.user?.id);
  return { id: data.user.id, email };
}

async function userClient(user) {
  const client = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email: user.email,
    password,
  });
  assert.ifError(error);
  return client;
}

async function insertOne(table, values, columns = "id") {
  const { data, error } = await service.from(table).insert(values).select(columns).single();
  assert.ifError(error);
  return data;
}

async function expectHidden(promise, label) {
  const { data, error } = await promise;
  assert.ifError(error);
  assert.deepEqual(data, [], label);
}

const [prospect, clientA, clientB, admin] = await Promise.all([
  createUser("prospect"),
  createUser("client-a"),
  createUser("client-b"),
  createUser("admin"),
]);

assert.ifError((await service.from("customer_access").update({ status: "client_active" }).eq("user_id", clientA.id)).error);
assert.ifError((await service.from("customer_access").update({ status: "client_completed" }).eq("user_id", clientB.id)).error);
assert.ifError((await service.from("user_roles").update({ role: "admin" }).eq("user_id", admin.id)).error);

const university = await insertOne("universities", {
  name: "Local IDOR University",
  website_url: "https://example.test",
  source_url: "https://example.test/university",
  verified_at: new Date().toISOString(),
});
const program = await insertOne("programs", {
  university_id: university.id,
  name: "Local IDOR Program",
  degree_level: "master",
  application_url: "https://example.test/apply",
  source_url: "https://example.test/program",
  verified_at: new Date().toISOString(),
  intake_terms: ["winter"],
  is_active: true,
});

const prospectRows = await Promise.all([
  insertOne("prospects", { email: prospect.email, user_id: prospect.id }),
  insertOne("prospects", { email: clientB.email, user_id: clientB.id }),
]);
const otherOrientation = await insertOne("orientations", {
  prospect_id: prospectRows[1].id,
  engine_version: "local-idor-test",
});

const [applicationB, documentB, projectB, recommendationB] = await Promise.all([
  insertOne("applications", {
    student_id: clientB.id,
    program_id: program.id,
    intake: "winter",
  }),
  insertOne("documents", {
    student_id: clientB.id,
    storage_path: `${clientB.id}/idor.pdf`,
    original_filename: "idor.pdf",
    mime_type: "application/pdf",
    size_bytes: 4,
    uploaded_by: clientB.id,
  }),
  insertOne("student_projects", {
    student_id: clientB.id,
    path: "university_search",
  }),
  insertOne("program_recommendations", {
    student_id: clientB.id,
    program_id: program.id,
    admin_id: admin.id,
  }),
]);

const [prospectClient, clientAClient, clientBClient] = await Promise.all([
  userClient(prospect),
  userClient(clientA),
  userClient(clientB),
]);

const uploaded = await clientBClient.storage
  .from("student-documents")
  .upload(`${clientB.id}/idor.pdf`, new Uint8Array([1, 2, 3, 4]), {
    contentType: "application/pdf",
    upsert: false,
  });
assert.ifError(uploaded.error);

const messageResult = await clientBClient
  .from("student_dossier_messages")
  .insert({
    student_id: clientB.id,
    sender_id: clientB.id,
    sender_role: "student",
    body: "Local IDOR message",
  })
  .select("id")
  .single();
assert.ifError(messageResult.error);
const messageB = messageResult.data;

// Client A cannot enumerate or mutate Client B resources by identifier.
await expectHidden(clientAClient.from("profiles").select("id").eq("id", clientB.id), "student ID is hidden");
await expectHidden(clientAClient.from("applications").select("id").eq("id", applicationB.id), "application ID is hidden");
await expectHidden(clientAClient.from("documents").select("id").eq("id", documentB.id), "document ID is hidden");
await expectHidden(clientAClient.from("student_dossier_messages").select("id").eq("id", messageB.id), "message ID is hidden");
await expectHidden(clientAClient.from("student_projects").select("id").eq("id", projectB.id), "project ID is hidden");
await expectHidden(clientAClient.from("program_recommendations").select("id").eq("id", recommendationB.id), "recommendation ID is hidden");
await expectHidden(
  clientAClient.from("student_projects").update({ notes: "cross-account" }).eq("id", projectB.id).select("id"),
  "cross-account project update changes no row",
);
await expectHidden(
  clientAClient.from("documents").delete().eq("id", documentB.id).select("id"),
  "cross-account document delete changes no row",
);

// Prospect identifiers cannot be used to cross prospect or client boundaries.
await expectHidden(prospectClient.from("prospects").select("id").eq("id", prospectRows[1].id), "other prospect ID is hidden");
await expectHidden(prospectClient.from("orientations").select("id").eq("id", otherOrientation.id), "other orientation ID is hidden");
await expectHidden(prospectClient.from("profiles").select("id").eq("id", clientB.id), "client profile is hidden from prospect");
await expectHidden(prospectClient.from("applications").select("id").eq("id", applicationB.id), "client application is hidden from prospect");
await expectHidden(prospectClient.from("documents").select("id").eq("id", documentB.id), "client document is hidden from prospect");
await expectHidden(prospectClient.from("student_projects").select("id").eq("id", projectB.id), "client project is hidden from prospect");

const signedForeign = await clientAClient.storage
  .from("student-documents")
  .createSignedUrl(`${clientB.id}/idor.pdf`, 60);
assert.ok(signedForeign.error, "client A must not sign client B object URL");
assert.equal(signedForeign.data, null);

const ownProspectUpload = await prospectClient.storage
  .from("student-documents")
  .upload(`${prospect.id}/own.pdf`, new Uint8Array([1]), {
    contentType: "application/pdf",
    upsert: false,
  });
assert.ifError(ownProspectUpload.error);

const foreignProspectUpload = await prospectClient.storage
  .from("student-documents")
  .upload(`${clientB.id}/foreign.pdf`, new Uint8Array([1]), {
    contentType: "application/pdf",
    upsert: true,
  });
assert.ok(foreignProspectUpload.error, "prospect must not upload or upsert another user's path");

console.log("local Supabase IDOR/BOLA API assertions passed");
