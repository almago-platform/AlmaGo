-- AlmaGo Simple Content V1
-- Student-visible catalogue copy only. Sources, verification dates, prices and business rules stay unchanged.

update public.finance_insurance_catalog
set
  description = 'Informations sur l’assurance maladie publique allemande pour les étudiants internationaux, y compris la preuve d’assurance électronique demandée par l’université.',
  price_notes = 'La cotisation dépend de l’AOK régionale et de votre situation. Vérifiez le montant actuel sur le site officiel.',
  eligibility_notes = 'La Tunisie a un accord de sécurité sociale avec l’Allemagne. Demandez le document nécessaire à votre assurance tunisienne, puis faites vérifier votre situation par une caisse allemande.'
where is_active = true
  and provider_name = 'AOK'
  and kind = 'health_insurance_provider';

update public.finance_insurance_catalog
set
  description = 'Service numérique de compte bloqué pour les démarches de visa et de séjour en Allemagne. Consultez la page officielle pour les frais d’ouverture et de gestion.',
  price_notes = 'Vérifié le 26 sept. 2026 : 119 € d’ouverture et 9 € par mois. L’argent bloqué reste votre argent ; ces frais s’y ajoutent.',
  eligibility_notes = 'Vérifiez auprès de l’autorité compétente le montant demandé et si le compte bloqué convient à votre situation.'
where is_active = true
  and provider_name = 'Expatrio'
  and kind = 'blocked_account_provider';

update public.finance_insurance_catalog
set
  description = 'Service numérique de compte bloqué pour prouver votre financement. Le compte est ouvert à votre nom ; la confirmation est délivrée après le dépôt des fonds.',
  price_notes = 'Vérifié le 26 sept. 2026 : 159 € d’ouverture, puis 9,90 € par mois. L’argent bloqué est séparé des frais ; son montant dépend de l’autorité compétente.',
  eligibility_notes = 'Un compte bloqué n’est qu’une solution possible. Vérifiez le montant et le justificatif accepté par la mission allemande ou l’autorité compétente.'
where is_active = true
  and provider_name = 'Fintiba'
  and kind = 'blocked_account_provider';

update public.finance_insurance_catalog
set
  description = 'Prêt pour les frais de vie pendant certaines études ou doctorats dans un établissement reconnu en Allemagne.',
  price_notes = 'KfW annonce 100 à 650 € par mois. Le taux d’intérêt est variable et peut changer tous les six mois. Vérifiez le taux avant de demander.',
  eligibility_notes = 'Seules les catégories listées par KfW peuvent demander ce prêt. Un étudiant international hors UE n’y a pas automatiquement droit.'
where is_active = true
  and provider_name = 'KfW'
  and kind = 'student_financing_option';

update public.finance_insurance_catalog
set
  description = 'Assurance maladie publique allemande pour étudiants. Une preuve d’assurance électronique est généralement demandée par l’université.',
  price_notes = 'Le montant 2026 dépend notamment de l’âge et des enfants. Vérifiez le total actuel avant d’adhérer.',
  eligibility_notes = 'L’accès au tarif étudiant dépend de l’inscription et de votre situation d’assurance. Un cours de langue, un Studienkolleg ou certaines préparations ne donnent pas automatiquement droit à ce tarif.'
where is_active = true
  and provider_name = 'Techniker Krankenkasse (TK)'
  and kind = 'health_insurance_provider';

update public.regulatory_sources
set summary = 'Pour un cours d’allemand sans études prévues, la page de l’ambassade à Tunis demande au moins 18 heures de cours par semaine, une preuve de financement et une assurance maladie. Ce motif est séparé des études universitaires.'
where is_active = true and topic = 'standalone_language_tunisia' and origin_country = 'TN';

update public.regulatory_sources
set summary = 'Pour préparer des études, la liste de l’ambassade à Tunis demande un cours d’au moins 20 heures par semaine, au moins le niveau A2 auprès d’un organisme certifié ALTE, une base académique comme une admission conditionnelle ou une Bewerberbestätigung, une preuve de financement et une assurance maladie.'
where is_active = true and topic = 'study_preparation_tunisia' and origin_country = 'TN';

update public.regulatory_sources
set summary = 'Pour un visa d’études, les informations fédérales demandent une admission universitaire et un financement assuré. Un visa pour rechercher une place d’études peut parfois être possible avant le choix final de l’université.'
where is_active = true and topic = 'study_visa';

update public.regulatory_sources
set summary = 'Dans de nombreux cas, un visa pour rechercher une place d’études peut être demandé avant le choix final de l’université.'
where is_active = true and topic = 'study_place_search';

update public.regulatory_sources
set summary = 'Les informations fédérales indiquent plusieurs preuves de financement possibles : ressources des parents, déclaration de prise en charge, compte bloqué, garantie bancaire allemande ou certaines bourses.'
where is_active = true and topic = 'study_visa_financing';

update public.regulatory_sources
set summary = 'uni-assist explique comment vérifier les conditions scolaires et les critères de chaque université pour un Bachelor, un Master, un Studienkolleg ou une préparation linguistique.'
where is_active = true and topic = 'university_admission';

update public.programs
set diploma_required = 'Premier diplôme universitaire reconnu avec une formation académique dans un domaine lié au programme.'
where is_active = true and name = 'Computer Engineering' and degree_level = 'Master';

update public.programs
set diploma_required = 'Premier diplôme universitaire pertinent donnant accès au programme, avec les justificatifs demandés pour la candidature.'
where is_active = true and name = 'Computer Science' and degree_level = 'Master';

update public.programs
set diploma_required = 'Diplôme donnant un accès direct aux études de Bachelor en Allemagne, avec les justificatifs de sélection demandés par le programme.'
where is_active = true and name = 'Computer Science (English)' and degree_level = 'Bachelor';

update public.programs
set diploma_required = 'Premier diplôme qualifiant professionnellement en informatique ou dans un domaine très proche.'
where is_active = true and name = 'Computer Science (Informatik)' and degree_level = 'Master';

update public.programs
set diploma_required = 'Diplôme donnant accès à l’enseignement supérieur ; les diplômes étrangers sont évalués selon la procédure de la TUM.'
where is_active = true and name = 'Informatics' and degree_level = 'Bachelor';

update public.programs
set diploma_required = 'Diplôme de Bachelor pertinent, évalué dans la procédure d’aptitude de la TUM.'
where is_active = true and name = 'Informatics' and degree_level = 'Master';

update public.checklist_templates
set title = 'Vérifier mon profil',
    description = 'Complétez les informations obligatoires.'
where is_active = true and key = 'profile_complete';

update public.checklist_templates
set title = 'Ajouter mon passeport',
    description = 'Ajoutez un passeport lisible. Son statut apparaîtra ici.'
where is_active = true and key = 'passport';

update public.checklist_templates
set title = 'Préparer les traductions demandées',
    description = 'Préparez les traductions demandées.'
where is_active = true and key = 'translation';

update public.checklist_templates
set title = 'Consulter mes programmes proposés',
    description = 'Comparez les programmes proposés dans votre dossier.'
where is_active = true and key = 'orientation';

update public.checklist_templates
set title = 'Préparer mes candidatures',
    description = 'Préparez chaque candidature avec les informations de votre dossier.'
where is_active = true and key = 'applications';

update public.checklist_templates
set title = 'Consulter les réponses des universités',
    description = 'Consultez les décisions reçues des universités.'
where is_active = true and key = 'admission';

update public.checklist_templates
set title = 'Préparer le départ après admission',
    description = 'Préparez les étapes utiles après votre admission.'
where is_active = true and key = 'germany_preparation';
