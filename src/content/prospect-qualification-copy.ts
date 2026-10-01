import type { Locale } from "@/lib/i18n";
import type {
  ProspectQualificationNextAction,
  ProspectQualificationState,
} from "@/lib/phase2/qualification";

type QualificationStateCopy = {
  label: string;
  title: string;
  body: string;
};

type QualificationActionCopy = {
  label: string;
  body: string;
};

export type ProspectQualificationCopy = {
  eyebrow: string;
  title: string;
  unavailableTitle: string;
  unavailableBody: string;
  states: Record<ProspectQualificationState, QualificationStateCopy>;
  actions: Record<ProspectQualificationNextAction, QualificationActionCopy>;
  disclaimer: string;
};

const fr: ProspectQualificationCopy = {
  eyebrow: "Avancement du projet",
  title: "Où en est votre projet ?",
  unavailableTitle: "État du projet pas encore disponible",
  unavailableBody: "Cette ancienne orientation n’a pas encore d’état enregistré. Mettez à jour votre projet pour obtenir une nouvelle évaluation.",
  states: {
    not_evaluated: { label: "À examiner", title: "Nous devons encore examiner votre projet", body: "Il manque encore des informations pour savoir quelle est la prochaine étape." },
    too_early: { label: "En préparation", title: "Votre projet est encore en préparation", body: "Continuez à avancer progressivement. Vous n’avez pas besoin d’un accompagnement payant maintenant." },
    needs_information: { label: "À compléter", title: "Quelques informations sont encore nécessaires", body: "Complétez votre projet pour mieux déterminer la prochaine étape." },
    needs_verification: { label: "À vérifier", title: "Quelques points doivent être vérifiés", body: "Votre projet avance, mais certaines informations doivent être confirmées avant que notre équipe puisse l’examiner." },
    ready_for_review: { label: "Prêt à être examiné", title: "Votre projet peut être examiné par notre équipe", body: "Les informations nécessaires sont assez complètes pour passer à une vérification par notre équipe." },
    qualified_prospect: { label: "Prêt pour la suite", title: "Votre projet peut passer à l’étape suivante", body: "Notre équipe a vérifié votre projet. Vous pouvez maintenant consulter la prochaine étape proposée. Cela ne garantit ni admission ni visa." },
  },
  actions: {
    complete_project_information: { label: "Prochaine étape", body: "Mettez à jour votre projet et complétez les informations manquantes." },
    continue_preparation: { label: "Prochaine étape", body: "Continuez votre préparation et revenez mettre votre projet à jour lorsqu’un élément important évolue." },
    resolve_project_verification: { label: "Prochaine étape", body: "Traitez les points à vérifier dans vos prochaines étapes, puis mettez votre projet à jour." },
    request_human_review: { label: "Prochaine étape", body: "Votre projet est prêt à être examiné par notre équipe avant toute proposition d’accompagnement." },
  },
  disclaimer: "Cet état indique seulement où en est votre préparation. Il ne constitue ni une admission, ni une décision de visa.",
};

const ar: ProspectQualificationCopy = {
  eyebrow: "تقدّم المشروع",
  title: "إلى أين وصل مشروعك؟",
  unavailableTitle: "حالة المشروع غير متاحة بعد",
  unavailableBody: "هذا التوجيه القديم لا يحتوي بعد على حالة مسجلة. حدّث مشروعك للحصول على تقييم جديد.",
  states: {
    not_evaluated: { label: "بانتظار المراجعة", title: "نحتاج إلى مراجعة مشروعك", body: "ما زالت بعض المعلومات ناقصة لتحديد الخطوة التالية." },
    too_early: { label: "قيد التحضير", title: "مشروعك ما زال في مرحلة التحضير", body: "واصل التقدم تدريجيًا. لا تحتاج إلى مرافقة مدفوعة الآن." },
    needs_information: { label: "معلومات ناقصة", title: "نحتاج إلى بعض المعلومات الإضافية", body: "أكمل بيانات مشروعك حتى نتمكن من تحديد الخطوة التالية بشكل أوضح." },
    needs_verification: { label: "يحتاج إلى تحقق", title: "بعض النقاط تحتاج إلى التحقق", body: "مشروعك يتقدم، لكن يجب تأكيد بعض المعلومات قبل أن يتمكن فريقنا من مراجعته." },
    ready_for_review: { label: "جاهز للمراجعة", title: "مشروعك جاهز لمراجعة الفريق", body: "المعلومات المسجلة كافية للانتقال إلى مراجعة فريقنا." },
    qualified_prospect: { label: "جاهز للخطوة التالية", title: "يمكن لمشروعك الانتقال إلى الخطوة التالية", body: "راجع فريقنا مشروعك. يمكنك الآن الاطلاع على الخطوة التالية المقترحة. هذا لا يضمن القبول أو التأشيرة." },
  },
  actions: {
    complete_project_information: { label: "الخطوة التالية", body: "حدّث مشروعك وأكمل المعلومات الناقصة." },
    continue_preparation: { label: "الخطوة التالية", body: "واصل التحضير وارجع لتحديث مشروعك عندما تتغير معلومة مهمة." },
    resolve_project_verification: { label: "الخطوة التالية", body: "أكمل النقاط التي تحتاج إلى التحقق في خطواتك القادمة ثم حدّث مشروعك." },
    request_human_review: { label: "الخطوة التالية", body: "مشروعك جاهز الآن لمراجعة فريقنا قبل أي عرض للمرافقة." },
  },
  disclaimer: "هذه الحالة توضّح مدى تقدّم مشروعك فقط، ولا تمثل قبولًا جامعيًا أو قرار تأشيرة.",
};

const en: ProspectQualificationCopy = {
  eyebrow: "Project progress",
  title: "Where does your project stand?",
  unavailableTitle: "Project status is not available yet",
  unavailableBody: "This older orientation does not yet have a saved status. Update your project to receive a new assessment.",
  states: {
    not_evaluated: { label: "To review", title: "We still need to review your project", body: "Some information is still missing before we can identify the next step." },
    too_early: { label: "In preparation", title: "Your project is still being prepared", body: "Keep progressing step by step. You do not need paid support yet." },
    needs_information: { label: "Information needed", title: "A few details are still needed", body: "Complete your project information so the next step can be identified more clearly." },
    needs_verification: { label: "Needs verification", title: "A few points still need to be checked", body: "Your project is progressing, but some information must be confirmed before our team can review it." },
    ready_for_review: { label: "Ready for review", title: "Your project can be reviewed by our team", body: "The necessary information is complete enough for a review by our team." },
    qualified_prospect: { label: "Ready for the next step", title: "Your project can move to the next step", body: "Our team has reviewed your project. You can now see the next proposed step. This does not guarantee admission or a visa." },
  },
  actions: {
    complete_project_information: { label: "Next step", body: "Update your project and complete the missing information." },
    continue_preparation: { label: "Next step", body: "Continue preparing and update your project when an important element changes." },
    resolve_project_verification: { label: "Next step", body: "Work through the points that still need checking in your next steps, then update your project." },
    request_human_review: { label: "Next step", body: "Your project is ready for our team to review before any support offer is proposed." },
  },
  disclaimer: "This status only shows how far your preparation has progressed. It is not an admission or visa decision.",
};

const de: ProspectQualificationCopy = {
  eyebrow: "Projektfortschritt",
  title: "Wie weit ist dein Projekt?",
  unavailableTitle: "Projektstatus noch nicht verfügbar",
  unavailableBody: "Für diese ältere Orientierung ist noch kein Status gespeichert. Aktualisiere dein Projekt, um eine neue Einschätzung zu erhalten.",
  states: {
    not_evaluated: { label: "Zu prüfen", title: "Wir müssen dein Projekt noch prüfen", body: "Es fehlen noch einige Angaben, bevor wir den nächsten Schritt bestimmen können." },
    too_early: { label: "In Vorbereitung", title: "Dein Projekt befindet sich noch in Vorbereitung", body: "Arbeite Schritt für Schritt weiter. Eine bezahlte Begleitung brauchst du jetzt noch nicht." },
    needs_information: { label: "Zu ergänzen", title: "Einige Angaben fehlen noch", body: "Vervollständige dein Projekt, damit der nächste Schritt klarer bestimmt werden kann." },
    needs_verification: { label: "Zu prüfen", title: "Einige Punkte müssen noch geprüft werden", body: "Dein Projekt kommt voran, aber bestimmte Angaben müssen bestätigt werden, bevor unser Team es prüfen kann." },
    ready_for_review: { label: "Bereit zur Prüfung", title: "Unser Team kann dein Projekt jetzt prüfen", body: "Die nötigen Angaben sind vollständig genug für eine Prüfung durch unser Team." },
    qualified_prospect: { label: "Bereit für den nächsten Schritt", title: "Dein Projekt kann zum nächsten Schritt weitergehen", body: "Unser Team hat dein Projekt geprüft. Du kannst jetzt den nächsten vorgeschlagenen Schritt ansehen. Das garantiert weder Zulassung noch Visum." },
  },
  actions: {
    complete_project_information: { label: "Nächster Schritt", body: "Aktualisiere dein Projekt und ergänze die fehlenden Angaben." },
    continue_preparation: { label: "Nächster Schritt", body: "Setze deine Vorbereitung fort und aktualisiere dein Projekt, sobald sich ein wichtiger Punkt ändert." },
    resolve_project_verification: { label: "Nächster Schritt", body: "Bearbeite die noch offenen Prüfpunkte in deinen nächsten Schritten und aktualisiere danach dein Projekt." },
    request_human_review: { label: "Nächster Schritt", body: "Dein Projekt ist bereit für die Prüfung durch unser Team, bevor ein Begleitangebot vorgeschlagen wird." },
  },
  disclaimer: "Dieser Status zeigt nur, wie weit deine Vorbereitung ist. Er ist weder eine Zulassungs- noch eine Visumentscheidung.",
};

export const prospectQualificationCopy: Record<Locale, ProspectQualificationCopy> = {
  fr,
  ar,
  en,
  de,
};
