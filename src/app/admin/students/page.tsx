import { redirect } from "next/navigation";
import {
  AdminStudentsPanel,
  type AdminStudentListItem,
} from "@/components/admin/AdminStudentsPanel";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAdminUser } from "@/lib/auth/access";
import {
  countDocumentsNeedingStudentAction,
  countDocumentsWithAlmaGo,
  selectNextKnownDeadline,
  selectRecordedNextAction,
  summarizeChecklist,
} from "@/lib/admin/student-case";
import { isActiveApplication, isPastDeadline } from "@/lib/phase4";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) redirect("/login");
  if (!isAdmin) redirect("/unauthorized");

  const { data: studentRoles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "student");

  if (rolesError) return <StudentsUnavailable />;

  const studentRoleIds = (studentRoles || []).map((item) => item.user_id);
  if (studentRoleIds.length === 0) {
    return <StudentsPage students={[]} />;
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id,first_name,last_name,target_degree,target_field,onboarding_completed")
    .in("id", studentRoleIds)
    .order("last_name", { ascending: true, nullsFirst: false })
    .order("first_name", { ascending: true, nullsFirst: false })
    .limit(25);

  if (profilesError) return <StudentsUnavailable />;

  const studentIds = (profiles || []).map((profile) => profile.id);
  if (studentIds.length === 0) {
    return <StudentsPage students={[]} />;
  }

  const [
    { data: documents, error: documentsError },
    { data: checklist, error: checklistError },
    { data: applications, error: applicationsError },
    { data: history, error: historyError },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("student_id,status,created_at")
      .in("student_id", studentIds),
    supabase
      .from("student_checklist_items")
      .select("student_id,title,status,due_date,created_at")
      .in("student_id", studentIds),
    supabase
      .from("applications")
      .select("id,student_id,status,deadline,next_action,created_at")
      .in("student_id", studentIds),
    supabase
      .from("student_history")
      .select("student_id,event_type,message,created_at")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (documentsError || checklistError || applicationsError || historyError) {
    return <StudentsUnavailable />;
  }

  const students: AdminStudentListItem[] = (profiles || []).map((profile) => {
    const studentDocuments = (documents || []).filter((item) => item.student_id === profile.id);
    const studentChecklist = (checklist || []).filter((item) => item.student_id === profile.id);
    const studentApplications = (applications || []).filter((item) => item.student_id === profile.id);
    const activeApplications = studentApplications.filter((item) => isActiveApplication(item.status));
    const studentHistory = (history || [])
      .filter((item) => item.student_id === profile.id)
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    const documentsNeedingAction = countDocumentsNeedingStudentAction(studentDocuments);
    const documentsWithAlmaGo = countDocumentsWithAlmaGo(studentDocuments);
    const checklistSummary = summarizeChecklist(studentChecklist);
    const nextDeadlineApplication = selectNextKnownDeadline(activeApplications);
    const nextActionApplication = selectRecordedNextAction(activeApplications);
    const hasOverdueApplication = activeApplications.some(
      (application) => Boolean(application.deadline) && isPastDeadline(String(application.deadline)),
    );
    const lastActivity = studentHistory[0];

    const project = [profile.target_degree, profile.target_field]
      .filter(Boolean)
      .join(" · ") || "Projet d’études non renseigné";

    return {
      id: profile.id,
      name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Étudiant",
      project,
      onboardingCompleted: Boolean(profile.onboarding_completed),
      documentsNeedingAction,
      documentsWithAlmaGo,
      todoCount: checklistSummary.todo,
      activeApplications: activeApplications.length,
      nextDeadline: nextDeadlineApplication?.deadline || null,
      nextAction: nextActionApplication?.next_action?.trim() || null,
      lastActivity: lastActivity?.message || null,
      lastActivityAt: lastActivity?.created_at || null,
      hasPriority: Boolean(
        documentsNeedingAction ||
        documentsWithAlmaGo ||
        checklistSummary.todo ||
        hasOverdueApplication ||
        nextActionApplication,
      ),
    };
  });

  return <StudentsPage students={students} />;
}

function StudentsPage({ students }: { students: AdminStudentListItem[] }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Administration"
        title="Étudiants"
        description="Ouvrez un dossier transversal pour comprendre les éléments enregistrés, les prochaines dates connues et les actions réellement identifiables sans score ni classement."
      />
      <AdminStudentsPanel students={students} />
    </main>
  );
}

function StudentsUnavailable() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader badge="Administration" title="Étudiants" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-bold text-slate-950">Dossiers étudiants temporairement indisponibles</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Nous n’arrivons pas à charger la liste des dossiers pour le moment. Rien n’a été modifié.
          </p>
        </div>
      </Card>
    </main>
  );
}
