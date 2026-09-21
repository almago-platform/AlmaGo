import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'outputs','almago-lancement');
const read=async p=>JSON.parse((await fs.readFile(path.join(root,p),'utf8')).replace(/^\uFEFF/,''));
const [videos,carousels,stories,schedule,sources]=await Promise.all(['drafts/videos.json','drafts/carrousels.json','work/stories.json','work/schedule.json','work/sources.json'].map(read));
const contents=new Map([...videos,...carousels].map(x=>[x.id,x]));
const wb=Workbook.create();
const names=['Calendrier','Publications','Textes','Stories','Résultats','Sources'];
const sheets=Object.fromEntries(names.map(n=>[n,wb.worksheets.add(n)]));
const ink='#182C3A',cream='#F5F2EA',green='#176B5B',amber='#FFF0CF';
const joined=x=>Array.isArray(x)?x.join('\n'):String(x??'');
const tags=x=>Array.isArray(x)?x.join(' '):String(x??'');
const urls=ids=>[...new Set(ids.flatMap(id=>sources.find(s=>s.id===id)?.urls??[]))].join('\n');
const col=i=>{let s='';for(let n=i+1;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
function setup(name,title,note,headers,rows,widths,headerRow=4,height=84){
 const sh=sheets[name],last=headerRow+rows.length,end=col(headers.length-1);
 sh.showGridLines=false;sh.tabColor=green;
 sh.getRange(`A1:${end}${Math.max(last,4)}`).format.font={name:'Arial',size:11,color:ink};
 sh.getRange('A1').values=[[title]];sh.getRange('A1').format.font={name:'Arial',size:17,bold:true,color:ink};
 sh.getRange('A1').format.rowHeight=28;
 sh.getRange('A2').values=[[note]];sh.getRange('A2').format.font={name:'Arial',size:10,color:'#56636C'};
 sh.getRange(`A${headerRow}:${end}${headerRow}`).values=[headers];
 if(rows.length)sh.getRange(`A${headerRow+1}:${end}${last}`).values=rows;
 const table=sh.tables.add(`A${headerRow}:${end}${last}`,true,`Tbl${name.normalize('NFD').replace(/[\u0300-\u036f]/g,'')}`);
 table.showFilterButton=true;
 sh.getRange(`A${headerRow}:${end}${headerRow}`).format={fill:ink,font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:36,verticalAlignment:'center'};
 if(rows.length){
  sh.getRange(`A${headerRow+1}:${end}${last}`).format.wrapText=true;
  sh.getRange(`A${headerRow+1}:${end}${last}`).format.verticalAlignment='top';
  sh.getRange(`A${headerRow+1}:${end}${last}`).format.rowHeight=height;
  for(let i=0;i<rows.length;i++)if(i%2===1)sh.getRange(`A${headerRow+1+i}:${end}${headerRow+1+i}`).format.fill=cream;
 }
 widths.forEach((w,i)=>sh.getRange(`${col(i)}1:${col(i)}${last}`).format.columnWidthPx=w);
 sh.freezePanes.freezeRows(headerRow);
 return sh;
}
const fbVideos=new Set(['V03','V04','V06','V08']);
const dayNames=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const overview=schedule.map(x=>[x.day,null,dayNames[(x.day-1)%7],x.id,contents.get(x.id).title,x.id[0]==='V'?'IG 19:00 / TikTok 20:30'+(fbVideos.has(x.id)?' / FB 18:30':''):'IG 19:00 / FB 18:30',stories.filter(s=>s.day===x.day).map(s=>s.id+' '+s.time).join('\n'),x.category]);
const cal=setup('Calendrier','AlmaGo — 14 jours de lancement','Heure de Tunis. Créneaux à tester. Date de départ modifiable en B4.', ['Jour','Date','Jour de semaine','ID','Sujet','Publications','Stories IG / FB','Catégorie'],overview,[64,115,130,65,410,295,180,125],7,56);
cal.getRange('A4').values=[['Début']];cal.getRange('B4').values=[[new Date(Date.UTC(2026,8,28))]];cal.getRange('B4').setNumberFormat('dd/mm/yyyy');cal.getRange('B4').format.fill=amber;
cal.getRange('D4').values=[['Date proposée : confirmer avant programmation.']];
cal.getRange('A5').values=[['Chaque semaine : 4 vidéos, 3 carrousels, 8 stories. Aucun contenu publié ou programmé.']];
for(let i=0;i<14;i++)cal.getRange(`B${8+i}`).formulas=[[`=$B$4+A${8+i}-1`]];
cal.getRange('B8:B21').setNumberFormat('dd/mm/yyyy');
cal.getRange('A24').values=[['Utilisation']];cal.getRange('A24').format.font={bold:true};
const notes=[
 'Publications : une ligne par plateforme, textes de légende et briefs. Textes : scripts complets et chaque slide.',
 'Statuts : texte préparé, à produire, à valider, programmé, publié. Le statut initial ne signifie pas prêt à diffuser.',
 'Stories : 16 écrans. Les 3 CTA WhatsApp demandent un contact et une offre confirmés ; variante de pré-lancement incluse.',
 'Résultats : saisir uniquement les mesures réelles à âge comparable. Vide = non disponible ; zéro = mesure nulle.',
 'WhatsApp : le propriétaire transmet les totaux et origines déclarées. Aucune conversation ni donnée personnelle ici.',
 'Sources vérifiées le 21/09/2026. Recontrôler les informations sensibles le jour de la publication.',
 '30 unités originales : 21 éducatives, 6 confiance, 3 commerciales. Les déclinaisons de plateforme ne doublent pas ce total.'
];notes.forEach((n,i)=>cal.getRange(`A${25+i}`).values=[[n]]);
const pubs=[],pubmeta=[];
for(const slot of schedule){
 const c=contents.get(slot.id),video=c.id[0]==='V';
 const platforms=video?['Instagram','TikTok',...(fbVideos.has(c.id)?['Facebook']:[])]:['Instagram','Facebook'];
 for(const platform of platforms){
  const suffix=platform==='Instagram'?'IG':platform==='TikTok'?'TT':'FB';
  const hook=video?(c['hook'+suffix]||c.hookIG):c.slides[0].split('\n').slice(1).join('\n');
  const script=video?'Voix off intégrale : onglet Textes, '+c.id+'.\n'+(c.summary||c.title):c.slides[0]+'\n\nToutes les slides : onglet Textes, '+c.id+'.';
  let caption=c['caption'+suffix]??'';
  if(typeof caption!=='string')caption=joined(caption);
  const status=['C03','V04'].includes(c.id)?'Offre / méthode à confirmer':'Texte préparé ; visuel à produire';
  pubs.push([slot.day,null,(platform==='Instagram'?19:platform==='TikTok'?20.5:18.5)/24,platform,c.id,video?'Vidéo verticale':'Carrousel / album',c.title,'Français + tunisien',hook,script,caption,tags(c['hashtags'+suffix]),c.cta,joined(c.visual),status,slot.category,urls(slot.sourceIDs),'21/09/2026 ; recontrôler avant diffusion']);
  pubmeta.push({day:slot.day,id:c.id,platform});
 }
}
const pub=setup('Publications','Publications par plateforme','Légendes différenciées. Les textes complets à produire sont regroupés dans Textes.', ['Jour','Date','Heure Tunis','Plateforme','ID','Format','Sujet','Langue','Hook','Script ou texte','Caption','Hashtags','CTA','Visuel nécessaire','Statut','Catégorie','Sources officielles','Vérification'],pubs,[60,110,95,110,60,135,250,120,320,440,760,230,210,630,190,130,570,215],4,340);
pubs.forEach((_,i)=>pub.getRange(`B${i+5}`).formulas=[[`='Calendrier'!$B$4+A${i+5}-1`]]);
pub.getRange(`B5:B${pubs.length+4}`).setNumberFormat('dd/mm/yyyy');pub.getRange(`C5:C${pubs.length+4}`).setNumberFormat('hh:mm');
pub.getRange(`O5:O${pubs.length+4}`).dataValidation={rule:{type:'list',values:['Texte préparé ; visuel à produire','Offre / méthode à confirmer','À produire','À valider','Programmé','Publié']}};
const textRows=[];
for(const slot of schedule){const c=contents.get(slot.id);
 if(c.id[0]==='V'){
  textRows.push([c.id,'Vidéo',c.duration||'20–60 s',joined(c.voiceover),joined(c.screen),joined(c.visual),c.validation||'',urls(slot.sourceIDs)]);
 }else c.slides.forEach((s,i)=>textRows.push([c.id,'Carrousel',`Slide ${i+1}/${c.slides.length}`,s,'',c.visual.split('\n')[i]||c.visual,c.validation||'',urls(slot.sourceIDs)]));
}
setup('Textes','Scripts complets et slides','Choisir le hook de la plateforme dans Publications, puis enregistrer la voix off. Les durées sont à tester à la lecture.', ['ID','Format','Segment / durée','Texte intégral','Texte écran','Montage / visuel','Points à vérifier','Sources officielles'],textRows,[65,105,120,870,620,630,420,570],4,290);
const storyRows=stories.map(s=>[s.day,null,s.time.split(':').map(Number).reduce((h,m,i)=>i?h+m/60:m,0)/24,s.id,'Instagram / Facebook','Story · 1 écran',s.hook,s.language,s.text,s.captionIG,s.captionFB,'Aucun hashtag nécessaire',s.cta,s.visual,s.status,s.category,s.fallback,urls(s.sourceIDs)]);
const st=setup('Stories','Stories de lancement','8 écrans par semaine. Interactions à recréer dans chaque application. WhatsApp : validation du contact et de l’offre.', ['Jour','Date','Heure Tunis','ID','Plateforme','Format','Hook / sujet','Langue','Texte écran','Précision Instagram','Adaptation Facebook','Hashtags','CTA','Visuel nécessaire','Statut','Catégorie','Variante avant ouverture','Sources officielles'],storyRows,[60,110,95,70,155,135,240,130,530,450,450,155,220,390,220,130,520,550],4,185);
stories.forEach((_,i)=>st.getRange(`B${i+5}`).formulas=[[`='Calendrier'!$B$4+A${i+5}-1`]]);st.getRange('B5:B20').setNumberFormat('dd/mm/yyyy');st.getRange('C5:C20').setNumberFormat('hh:mm');
const metrics=[...pubmeta,...stories.flatMap(s=>['Instagram','Facebook'].map(platform=>({day:s.day,id:s.id,platform})))];
const resultRows=metrics.map(x=>[x.day,null,x.id,x.platform,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]);
const perf=setup('Résultats','Suivi des performances','Mesures à 48 h ou à 7 jours, à indiquer. Laisser vide si indisponible. WhatsApp : totaux attribués fournis par le propriétaire.', ['Jour','Date prévue','ID','Plateforme','Date du relevé','Âge (heures)','Vues','Portée','Abonnés gagnés','Sauvegardes','Partages','Commentaires','Clics contact','Messages sociaux','Contacts WhatsApp','Sauvegardes / portée','Partages / portée','Apprentissage','Action suivante'],resultRows,[60,110,65,105,115,100,95,95,115,115,100,120,115,125,140,135,135,390,390],4,48);
metrics.forEach((_,i)=>{const r=i+5;perf.getRange(`B${r}`).formulas=[[`='Calendrier'!$B$4+A${r}-1`]];perf.getRange(`P${r}:Q${r}`).formulas=[[`=IF(OR(H${r}="",H${r}=0,J${r}=""),"",J${r}/H${r})`,`=IF(OR(H${r}="",H${r}=0,K${r}=""),"",K${r}/H${r})`]];});
const pend=metrics.length+4;perf.getRange(`B5:B${pend}`).setNumberFormat('dd/mm/yyyy');perf.getRange(`E5:E${pend}`).setNumberFormat('dd/mm/yyyy');perf.getRange(`F5:O${pend}`).setNumberFormat('0');perf.getRange(`P5:Q${pend}`).setNumberFormat('0.0%');perf.getRange(`E5:O${pend}`).format.fill=amber;
const sourceRows=sources.map(s=>[s.id,s.subject,s.claim.replace(/[«»]/g,''),s.urls.join('\n'),new Date(Date.UTC(2026,8,21)),(s.detail.match(/- Actualisation : (.*)/)||[])[1]||'Non affichée',(s.detail.match(/- Limite : ([\s\S]*)/)||[])[1]?.trim()||'Vérifier les consignes complètes sur la source.']);
const src=setup('Sources','Registre des sources','Sources officielles consultées le 21/09/2026. La date de consultation ne vaut pas date de mise à jour des règles.', ['Référence','Sujet','Formulation prudente','URL officielle','Consultation','Date affichée / contexte','Limite'],sourceRows,[85,300,490,590,125,470,750],4,210);src.getRange('E5:E16').setNumberFormat('dd/mm/yyyy');
await fs.mkdir(path.join(root,'work','previews'),{recursive:true});
console.log((await wb.inspect({kind:'table',range:'Calendrier!A7:H10',include:'values,formulas',tableMaxRows:4,tableMaxCols:8,maxChars:2400})).ndjson);
console.log((await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:30},summary:'Contrôle des erreurs de formule',maxChars:1500})).ndjson);
// Tester les deux ratios avec un exemple transitoire, puis rendre les cellules vides.
perf.getRange('H5:K5').values=[[100,null,5,2]];
console.log((await wb.inspect({kind:'table',range:'Résultats!P4:Q5',include:'values,formulas',tableMaxRows:2,tableMaxCols:2,maxChars:1200})).ndjson);
perf.getRange('H5:K5').values=[[null,null,null,null]];
const views=[['Calendrier','A1:H12'],['Publications','I4:K5'],['Textes','A4:D6'],['Stories','G4:J6'],['Résultats','G4:Q8'],['Sources','A4:E6']];
for(const [sheetName,range] of views){const blob=await wb.render({sheetName,range,scale:1,format:'png'});await fs.writeFile(path.join(root,'work','previews',sheetName+'.png'),new Uint8Array(await blob.arrayBuffer()));}
const xlsx=await SpreadsheetFile.exportXlsx(wb);await xlsx.save(path.join(out,'AlmaGo-planning-14-jours.xlsx'));
await fs.writeFile(path.join(root,'work','workbook-summary.json'),JSON.stringify({publications:pubs.length,stories:stories.length,segments:textRows.length,resultRows:metrics.length,sources:sources.length}));
console.log('Saved AlmaGo-planning-14-jours.xlsx');
