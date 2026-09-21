import json,re
from pathlib import Path
from datetime import date,timedelta

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs'/'almago-lancement'
OUT.mkdir(parents=True,exist_ok=True)

# Une story = un écran ; les déclinaisons IG/FB ne doublent pas le volume éditorial.
raw=[
 (1,'12:30','Confiance','Tu en es où ?','توّا وين وصلت في قرايتك؟','Sondage : Bac / Université. Pour les diplômés, réponse libre « diplômé ».','Répondre au sondage','Fond crème, 2 cartes et sticker natif.'),
 (1,'18:00','Éducatif','Les 4 repères de ton profil','Parcours • formation visée • langues • budget et temps de préparation.\nأربع نقاط باش توضّح مشروعك.','Retrouve la fiche de départ dans le Reel du jour, dès sa mise en ligne.','Garder ces 4 repères','Carte à 4 cases. Aucun résultat d’admissibilité.'),
 (2,'12:30','Éducatif','Quel programme regardes-tu ?','Pour chaque programme : conserve son nom exact et son lien officiel.\nاكتب اسم التكوين والرابط الرسمي متاعو.','Pas besoin de poster tes documents : prépare ta fiche pour toi.','Créer sa fiche','Maquette générique de fiche marquée EXEMPLE.'),
 (3,'12:30','Éducatif','Avant de réserver un examen','Langue enseignée + niveau + preuve acceptée + date de dépôt.\nثبّت في شروط التكوين قبل ما تختار الامتحان.','Ces exigences dépendent du programme. Source : uni-assist, Language certificates.','Vérifier le programme','4 mots qui apparaissent successivement.'),
 (4,'18:00','Commercial','Besoin d’un premier échange ?','Pour une évaluation de ton profil, contacte AlmaGo sur WhatsApp.\nتحب تحكي على مشروعك؟ صاحب AlmaGo يجاوبك شخصيًّا.','Après ouverture seulement : sticker lien vers le contact vérifié. Aucune pièce personnelle en commentaire.','Contacter le propriétaire','Fond encre, cartouche contact sans faux numéro.'),
 (5,'12:30','Éducatif','Vrai ou faux ?','Une admission garantit le visa.\nقبول الجامعة يضمن الفيزا؟','Quiz : Faux. L’université décide de l’admission ; les autorités compétentes décident du visa. Source : Ambassade d’Allemagne à Tunis.','Répondre au quiz','Deux cartes Vrai / Faux, réponse explicative visible après interaction.'),
 (6,'12:30','Éducatif','Le bon réflexe pour un dossier','La liste de pièces dépend du programme et du destinataire.\nثبّت في القائمة الرسمية متاع ملفّك.','Ne mélange pas la checklist de candidature et celle du visa.','Vérifier sa checklist','Deux dossiers « candidature » et « visa ». Aucun document réel.'),
 (7,'18:00','Commercial','Ton projet mérite d’être clarifié','Pour une évaluation de ton profil, contacte AlmaGo sur WhatsApp.\nابدأ بملخّص على قرايتك ومشروعك.','Le propriétaire te répond personnellement et précise les services disponibles.','Contacter le propriétaire','Carte contact et logo. Lien seulement après vérification.'),
 (8,'12:30','Confiance','La prochaine explication ?','شنوّة تحب نفسّرولك أكثر؟\nLangue ou candidature ?','Sondage natif ; utiliser les réponses pour choisir un approfondissement.','Voter','2 cartes, fond crème, accent vert.'),
 (8,'18:00','Éducatif','VPD : retiens cette étape','VPD ≠ admission. La candidature auprès de l’université reste à déposer.\nبعد الـ VPD، يلزم تكمّل الترشّح حسب تعليمات الجامعة.','Source : uni-assist, VPD. Respecter le délai du programme.','Noter l’étape suivante','Diagramme de 3 cases, pas de tampon admission.'),
 (9,'12:30','Éducatif','Studienkolleg : automatique ?','Non : vérifie ton diplôme, ton parcours et les exigences du programme.\nموش قاعدة واحدة للناس الكلّ.','Source : DAAD admission database et uni-assist Studienkolleg. Pas de diagnostic individuel.','Consulter le carrousel après publication','Titre allemand séparé, définition française/tunisienne.'),
 (10,'12:30','Éducatif','Budget : pense à l’arrivée','Transport + installation + dépôt de garantie éventuel + premières dépenses.\nحضّر مصاريف الوصول زادة.','Ajoute ces postes à ton budget réel. Source : DAAD, finances.','Ajouter les frais d’arrivée','Liste animée sans montant inventé.'),
 (11,'12:30','Éducatif','Logement : compare le total','Loyer, charges et dépenses payées séparément.\nثبّت شنوة داخل في الكراء وشنوة تخلّص وحدو.','Source : DAAD, Renting a Room. Les conditions varient selon le logement.','Comparer les postes','3 colonnes sans prix ni offre immobilière.'),
 (12,'12:30','Éducatif','Un programme, une échéance','Note aussi les étapes préalables et le moment où fournir les justificatifs.\nموش نفس آخر أجل لكل التكوينات.','Source : uni-assist, Plan your application. Vérifie le programme exact.','Compléter son calendrier','Calendrier fictif avec cases vides.'),
 (13,'18:00','Commercial','Étudiant ou parent : parlons du projet','Pour une évaluation de ton profil, contacte AlmaGo sur WhatsApp.\nطالب وإلا وليّ، تنجم تحكي مع صاحب AlmaGo على المشروع.','Coordonnées et conditions de l’évaluation confirmées avant publication.','Contacter le propriétaire','Carte contact avec lien vérifié, sans promesse de résultat.'),
 (14,'18:00','Confiance','Quelle question reste ouverte ?','شنوّة السؤال اللي مازال عندك؟\nPose une question générale, sans données personnelles.','Sticker question. Sélectionner des questions anonymisées pour la suite, sans inventer de réponse reçue.','Poser une question','Fond crème, champ question, logo discret.')
]
stories=[]
for i,(day,time,category,hook,body,note,cta,visual) in enumerate(raw,1):
    commercial=category=='Commercial'
    stories.append(dict(id=f'ST{i:02}',day=day,time=time,category=category,hook=hook,
       text=body,captionIG=note,
       captionFB=note.replace('Sondage natif','Question dans la story').replace('Reel','vidéo'),
       cta=cta,visual=visual,language='Français + tunisien',
       status='Contact et offre à confirmer' if commercial else 'Texte préparé ; visuel à produire',
       fallback='L’accompagnement AlmaGo se prépare. Abonne-toi pour connaître son ouverture.\nخدمات AlmaGo تتحضّر. تابعنا باش تعرف وقتاش نبدأوا.' if commercial else '',
       sourceIDs=({3:['S09'],5:['S01','S02'],6:['S07'],8:['S05'],9:['S10','S11'],10:['S03'],11:['S12'],12:['S06']}.get(day,[]) if not commercial else [])))
(ROOT/'work'/'stories.json').write_text(json.dumps(stories,ensure_ascii=False,indent=2),encoding='utf-8')

schedule=[('V01','Éducatif'),('C01','Éducatif'),('V02','Éducatif'),('C02','Éducatif'),('V03','Éducatif'),('C03','Confiance'),('V04','Confiance'),('V05','Éducatif'),('C04','Éducatif'),('V06','Éducatif'),('C05','Éducatif'),('V07','Éducatif'),('C06','Confiance'),('V08','Éducatif')]
days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']
sourceText=(ROOT/'research'/'SOURCES_VERIFIEES.md').read_text(encoding='utf-8')
sources=[]
for m in re.finditer(r'### (S\d+) — (.*?)\n(.*?)(?=\n### |\n## Correspondance)',sourceText,re.S):
    text=m.group(3)
    sources.append(dict(id=m.group(1),subject=m.group(2),urls=list(dict.fromkeys(re.findall(r'\]\((https://[^)]+)\)',text))),claim=(re.search(r'\*\*Formulation sûre :\*\* (.*)',text) or ['',''])[1],detail=text))
(ROOT/'work'/'sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
sourceMap={'V01':['S10'],'V02':['S09'],'V03':['S01','S02'],'V04':[],'V05':['S04','S05'],'V06':['S03'],'V07':['S06'],'V08':['S09'],'C01':['S01','S03','S04','S06','S10'],'C02':['S07','S08'],'C03':[],'C04':['S10','S11'],'C05':['S03','S12'],'C06':[]}
(ROOT/'work'/'schedule.json').write_text(json.dumps([dict(day=i,id=x[0],category=x[1],sourceIDs=sourceMap[x[0]]) for i,x in enumerate(schedule,1)],ensure_ascii=False,indent=2),encoding='utf-8')

g=['## G. Planning des 14 premiers jours','',
'Hypothèse : lundi 28 septembre au dimanche 11 octobre 2026. Tous les horaires ci-dessous sont en **heure de Tunis**. Ils sont à tester ; aucun historique ne permet encore de choisir un meilleur créneau. Le calendrier Excel reprend les champs de production complets, avec une ligne par déclinaison de plateforme.','',
'Chaque semaine : **4 vidéos originales**, publiées sur Instagram et TikTok ; **3 carrousels**, déclinés pour Instagram et Facebook ; **8 écrans de stories**, adaptés à Instagram et Facebook. Quatre vidéos disposent aussi d’une diffusion Facebook : V03, V04, V06 et V08. Les reposts sur plusieurs réseaux ne sont pas comptés comme de nouveaux sujets.','',
'La répartition des 30 unités éditoriales (14 publications originales + 16 stories) est de 21 éducatives, 6 confiance/communauté et 3 commerciales, soit 70/20/10. Les 3 stories commerciales ne paraissent avec leur CTA WhatsApp qu’après confirmation de l’offre et du contact ; une variante de pré-lancement est fournie. Le ratio changera si ces variantes sont utilisées.','',
'| Jour | Date proposée | Publication principale | Instagram | TikTok | Facebook | Stories IG / FB |',
'|---|---|---|---|---|---|---|']
for i,(ident,cat) in enumerate(schedule,1):
    when=date(2026,9,28)+timedelta(days=i-1)
    isVideo=ident[0]=='V'
    fb=not isVideo or ident in ['V03','V04','V06','V08']
    st=' ; '.join(s['id']+' '+s['time'] for s in stories if s['day']==i)
    g.append(f'| J{i} {days[(i-1)%7]} | {when:%d/%m/%Y} | {ident} · {cat} | 19:00 | {"20:30" if isVideo else "—"} | {"18:30" if fb else "—"} | {st} |')
g+=['','**Statuts initiaux :** textes préparés ; montage / design à produire. C03 et V04 demandent la confirmation de la méthode et des services. Les stories ST05, ST08 et ST15 demandent un contact WhatsApp activé et les conditions de l’évaluation. Sources consultées le 21/09/2026, à recontrôler avant diffusion.','',
'**Adaptation Facebook des vidéos sélectionnées :** employer le hook français prévu, les sous-titres français dominants et la légende dédiée. Pour V03 et V04, adapter aussi la voix off aux formulations françaises prévues dans les scripts. Les carrousels deviennent des albums de slides numérotées avec une introduction pensée pour les étudiants et leurs parents.','',
'**Organisation :** finaliser les contenus de la semaine avant J1, vérifier chaque source sensible au moment de programmer, relire les légendes dans l’aperçu de chaque réseau. Prévoir un passage manuel dans les commentaires après la publication et le lendemain, selon la disponibilité convenue. À J7, premier bilan ; à J14, bilan comparatif et choix de la suite.','',
'### Les 16 stories, texte et brief','']
for s in stories:
    g += [f'#### {s["id"]} — J{s["day"]} à {s["time"]} — {s["hook"]}', '',f'**Catégorie :** {s["category"]}. **Statut :** {s["status"]}.', '',s['text'],'',f'**Interaction / précision IG :** {s["captionIG"]}', '',f'**Adaptation FB :** {s["captionFB"]} Si le sticker n’existe pas, poser la question avec les réponses de story activées.','',f'**CTA :** {s["cta"]}. **Visuel :** {s["visual"]}', '']
    if s['fallback']:g+=['**Version si le contact n’est pas encore ouvert :** '+s['fallback'],'']
    if s['sourceIDs']:g+=['**Références :** '+', '.join(s['sourceIDs'])+' dans le registre de sources.','']
(ROOT/'drafts'/'planning.md').write_text('\n'.join(g),encoding='utf-8')
print('Prepared 14 publication slots, 16 story screens,',len(sources),'source records.')
