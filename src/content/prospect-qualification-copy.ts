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
  eyebrow: "État de préparation",
  title: "Où en est votre projet ?",
  unavailableTitle: "Qualification pas encore calculée",
  unavailableBody: "Cette ancienne orientation n’a pas encore de qualification enregistrée. Mettez à jour votre projet pour obtenir un nouvel état.",
  states: {
    not_evaluated: { label: "À évaluer", title: "Votre projet doit encore être évalué", body: "Nous n’avons pas encore assez d’éléments enregistrés pour situer votre projet." },
    too_early: { label: "Encore tôt", title: "Votre projet est encore en préparation", body: "Vous pouvez avancer progressivement sans ouvrir maintenant un accompagnement payant." },
    needs_information: { label: "À compléter", title: "Quelques informations sont encore nécessaires", body: "Complétez votre projet pour permettre une évaluation plus précise de la prochaine étape." },
    needs_verification: { label: "À vérifier", title: "Certains éléments doivent être vérifiés", body: "Votre projet avance, mais certains points doivent encore être confirmés avant une revue humaine." },
    ready_for_review: { label: "Prêt pour revue", title: "Votre projet est prêt pour une revue humaine", body: "Les informations enregistrées sont suffisamment structurées pour passer à une vérification humaine." },
    qualified_prospect: { label: "Projet qualifié", title: "Votre projet a été qualifié pour la prochaine étape", body: "Une revue humaine a confirmé que votre projet peut passer à l’étape commerciale suivante. Cela ne garantit ni admission ni visa." },
  },
  actions: {
    complete_project_information: { label: "Prochaine étape", body: "Mettez à jour votre projet et complétez les informations manquantes." },
    continue_preparation: { label: "Prochaine étape", body: "Continuez votre préparation et revenez mettre votre projet à jour lorsqu’un élément important évolue." },
    resolve_project_verification: { label: "Prochaine étape", body: "Traitez les vérifications affichées dans votre roadmap, puis mettez votre projet à jour." },
    request_human_review: { label: "Prochaine étape", body: "Votre projet peut maintenant être examiné par l’équipe avant toute proposition d’accompagnement." },
  },
  disclaimer: "La qualification AlmaGo décrit l’état de préparation de votre projet. Elle ne constitue ni une admission, ni une décision de visa.",
};

const ar: ProspectQualificationCopy = {
  eyebrow: "حالة الاستعداد",
  title: "إلى أين وصل مشروعك؟",
  unavailableTitle: "لم يتم احتساب حالة المشروع بعد",
  unavailableBody: "هذا التوجيه القديم لا يحتوي بعد على حالة تأهيل محفوظة. حدّث مشروعك للحصول على تقييم جديد.",
  states: {
    not_evaluated: { label: "بانتظار التقييم", title: "مشروعك ما زال يحتاج إلى تقييم", body: "لا تتوفر بعد معلومات محفوظة كافية لتحديد المرحلة الحالية لمشروعك." },
    too_early: { label: "ما زال مبكرًا", title: "مشروعك ما زال في مرحلة التحضير", body: "يمكنك التقدم تدريجيًا من دون فتح مرافقة مدفوعة الآن." },
    needs_information: { label: "معلومات ناقصة", title: "نحتاج إلى بعض المعلومات الإضافية", body: "أكمل بيانات مشروعك حتى يمكن تحديد الخطوة التالية بشكل أوضح." },
    needs_verification: { label: "يحتاج إلى تحقق", title: "بعض العناصر تحتاج إلى التحقق", body: "مشروعك يتقدم، لكن يجب تأكيد بعض النقاط قبل المراجعة البشرية." },
    ready_for_review: { label: "جاهز للمراجعة", title: "مشروعك جاهز للمراجعة البشرية", body: "المعلومات المسجلة أصبحت منظمة بما يكفي للانتقال إلى مراجعة بشرية." },
    qualified_prospect: { label: "مشروع مؤهل", title: "تم تأهيل مشروعك للخطوة التالية", body: "أكدت مراجعة بشرية أن مشروعك يمكن أن ينتقل إلى المرحلة التجارية التالية. هذا لا يضمن القبول أو التأشيرة." },
  },
  actions: {
    complete_project_information: { label: "الخطوة التالية", body: "حدّث مشروعك وأكمل المعلومات الناقصة." },
    continue_preparation: { label: "الخطوة التالية", body: "واصل التحضير وارجع لتحديث مشروعك عندما تتغير معلومة مهمة." },
    resolve_project_verification: { label: "الخطوة التالية", body: "أكمل نقاط التحقق الموجودة في خارطة الطريق ثم حدّث مشروعك." },
    request_human_review: { label: "الخطوة التالية", body: "يمكن الآن لفريقنا مراجعة مشروعك قبل أي عرض للمرافقة." },
  },
  disclaimer: "تأهيل AlmaGo يصف مدى جاهزية مشروعك فقط، ولا يمثل قبولًا جامعيًا أو قرار تأشيرة.",
};

const en: ProspectQualificationCopy = {
  eyebrow: "Preparation status",
  title: "Where does your project stand?",
  unavailableTitle: "Qualification not calculated yet",
  unavailableBody: "This older orientation does not yet have a stored qualification. Update your project to receive a new status.",
  states: {
    not_evaluated: { label: "To evaluate", title: "Your project still needs to be evaluated", body: "We do not yet have enough stored information to place your project at a preparation stage." },
    too_early: { label: "Still early", title: "Your project is still being prepared", body: "You can keep progressing gradually without opening paid support now." },
    needs_information: { label: "Information needed", title: "A few details are still needed", body: "Complete your project information so the next step can be assessed more precisely." },
    needs_verification: { label: "Needs verification", title: "Some elements still need verification", body: "Your project is progressing, but some points must be confirmed before human review." },
    ready_for_review: { label: "Ready for review", title: "Your project is ready for human review", body: "The stored information is structured enough for a human verification step." },
    qualified_prospect: { label: "Project qualified", title: "Your project has been qualified for the next step", body: "A human review confirmed that your project can move to the next commercial step. This does not guarantee admission or a visa." },
  },
  actions: {
    complete_project_information: { label: "Next step", body: "Update your project and complete the missing information." },
    continue_preparation: { label: "Next step", body: "Continue preparing and update your project when an important element changes." },
    resolve_project_verification: { label: "Next step", body: "Work through the verification items in your roadmap, then update your project." },
    request_human_review: { label: "Next step", body: "Your project can now be reviewed by the team before any support offer is proposed." },
  },
  disclaimer: "AlmaGo qualification describes how prepared your project is. It is not an admission or visa decision.",
};

const de: ProspectQualificationCopy = {
  eyebrow: "Vorbereitungsstatus",
  title: "Wie weit ist dein Projekt?",
  unavailableTitle: "Qualifikation noch nicht berechnet",
  unavailableBody: "Für diese ältere Orientierung ist noch keine Qualifikation gespeichert. Aktualisiere dein Projekt, um einen neuen Status zu erhalten.",
  states: {
    not_evaluated: { label: "Zu prüfen", title: "Dein Projekt muss noch bewertet werden", body: "Es sind noch nicht genug gespeicherte Angaben vorhanden, um den Vorbereitungsstand einzuordnen." },
    too_early: { label: "Noch früh", title: "Dein Projekt befindet sich noch in Vorbereitung", body: "Du kannst schrittweise weiterarbeiten, ohne jetzt eine bezahlte Begleitung zu eröffnen." },
    needs_information: { label: "Zu ergänzen", title: "Einige Angaben fehlen noch", body: "Vervollständige dein Projekt, damit der nächste Schritt genauer bestimmt werden kann." },
    needs_verification: { label: "Zu prüfen", title: "Einige Punkte müssen noch geprüft werden", body: "Dein Projekt kommt voran, aber bestimmte Punkte müssen vor einer menschlichen Prüfung bestätigt werden." },
    ready_for_review: { label: "Bereit zur Prüfung", title: "Dein Projekt ist bereit für eine menschliche Prüfung", body: "Die gespeicherten Angaben sind ausreichend strukturiert für den nächsten Prüfungs­schritt." },
    qualified_prospect: { label: "Projekt qualifiziert", title: "Dein Projekt wurde für den nächsten Schritt qualifiziert", body: "Eine menschliche Prüfung hat bestätigt, dass dein Projekt in die nächste kommerzielle Phase gehen kann. Das garantiert weder Zulassung noch Visum." },
  },
  actions: {
    complete_project_information: { label: "Nächster Schritt", body: "Aktualisiere dein Projekt und ergänze die fehlenden Angaben." },
    continue_preparation: { label: "Nächster Schritt", body: "Setze deine Vorbereitung fort und aktualisiere dein Projekt, sobald sich ein wichtiger Punkt ändert." },
    resolve_project_verification: { label: "Nächster Schritt", body: "Bearbeite die Prüfpunkte in deiner Roadmap und aktualisiere danach dein Projekt." },
    request_human_review: { label: "Nächster Schritt", body: "Dein Projekt kann nun vom Team geprüft werden, bevor ein Begleitangebot vorgeschlagen wird." },
  },
  disclaimer: "Die AlmaGo-Qualifikation beschreibt den Vorbereitungsstand deines Projekts. Sie ist weder eine Zulassungs- noch eine Visumentscheidung.",
};

export const prospectQualificationCopy: Record<Locale, ProspectQualificationCopy> = {
  fr,
  ar,
  en,
  de,
};
