import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/student/ProfileForm";

export const dynamic = "force-dynamic";
export default async function ProfilePage() { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/login"); const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single(); if (!profile?.onboarding_completed) redirect("/student/onboarding"); return <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Mon profil</p><h1 className="mt-2 text-3xl font-semibold">Tes informations</h1><p className="mt-2 mb-8 text-slate-600">Tu peux modifier les informations enregistrées dans ton dossier.</p><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><ProfileForm profile={profile} /></div></main>; }
