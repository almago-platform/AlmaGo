import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const out = path.resolve('outputs/almago-lancement');
await fs.mkdir(out, { recursive: true });
const C = { ink: '#182C3A', cream: '#F5F2EA', green: '#176B5B', apricot: '#F4A77D', white: '#FFFFFF' };
const swatches = [
  ['Encre', C.ink], ['Crème', C.cream], ['Vert profond', C.green], ['Abricot', C.apricot], ['Blanc', C.white]
];
const esc = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const text = (x,y,s,size=26,fill=C.ink,weight=400,attrs='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${attrs}>${esc(s)}</text>`;
const wordmark = (x,y,size,alma=C.ink,go=C.green) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" letter-spacing="-2"><tspan fill="${alma}">Alma</tspan><tspan fill="${go}">Go</tspan></text>`;
const rect = (x,y,w,h,fill,r=0,stroke='none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const line = (x1,y1,x2,y2,color,width=2) => `<path d="M${x1} ${y1}H${x2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const dot = (x,y,r,fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1400" viewBox="0 0 1800 1400" role="img" aria-labelledby="title desc">
<title id="title">AlmaGo — proposition d’identité visuelle</title>
<desc id="desc">Planche de marque avec cinq couleurs, un mot-symbole conceptuel, une couverture de carrousel bilingue et une carte pédagogique rappelant qu’une admission universitaire ne garantit pas un visa. Proposition, pas logo officiel.</desc>
<style>text { font-family: Arial, sans-serif; } .ar { font-family: Arial, sans-serif; direction: rtl; unicode-bidi: embed; }</style>
${rect(0,0,1800,1400,C.cream)}
${text(72,76,'AlmaGo / identité visuelle',25,C.ink,700)}
${rect(1396,41,330,52,C.white,26)}
${text(1561,75,'PROPOSITION · 01',19,C.ink,700,'text-anchor="middle" letter-spacing="1.5"')}

${wordmark(65,247,151)}
${text(72,309,'Étudier en Allemagne, étape par étape.',30,C.ink,400)}
${text(753,370,'من تونس لألمانيا، خطوة بخطوة',34,C.green,400,'class="ar" text-anchor="start" lang="ar"')}
${line(72,410,220,410,C.green,4)}
${dot(72,410,7,C.green)}${dot(146,410,7,C.green)}${dot(220,410,7,C.green)}
${text(248,419,'Clair. Structuré. Accessible.',25,C.ink)}

${text(961,130,'Palette de marque',24,C.ink,700)}
${swatches.map(([name,color],i) => {
  const x=961+i*153;
  return `${rect(x,158,137,133,color,18, (color===C.white||color===C.cream)?'#CBD2D0':'none')}
  ${text(x,329,name,22,C.ink,700)}
  ${text(x,363,color,21,C.ink)}`;
}).join('')}
${text(961,412,'Texte encre sur abricot · blanc sur encre ou vert',21,C.ink)}

${line(72,464,1726,464,'#CAD2CE',1)}
${text(72,515,'Le système',22,C.ink,700)}
${text(500,515,'Carrousel · 4:5',22,C.ink,700)}
${text(1208,515,'Reel / TikTok · 9:16',22,C.ink,700)}

${text(72,606,'Un chemin,',35,C.ink,700)}
${text(72,651,'des repères.',35,C.ink,700)}
${text(72,704,'Des étapes visibles,',24,C.ink)}
${text(72,738,'sans codes officiels.',24,C.ink)}
${line(72,782,310,782,C.green,4)}
${dot(72,782,8,C.green)}${dot(191,782,8,C.green)}${dot(310,782,8,C.green)}
${text(72,885,'Arial',61,C.ink,700)}
${text(72,934,'Aa / 0123',35,C.green)}
${text(72,1007,'Deux langues.',25,C.ink,700)}
${text(72,1043,'Des blocs distincts.',25,C.ink)}
${text(72,1105,'Une idée par visuel.',25,C.ink,700)}
${text(72,1141,'Sans visage.',25,C.ink)}
${text(72,1177,'Sans fausse preuve.',25,C.ink)}
${rect(72,1232,308,52,C.white,26)}
${text(226,1265,'Concept à valider',20,C.ink,700,'text-anchor="middle"')}

${rect(500,552,584,730,C.white,0)}
${wordmark(540,619,37)}
${rect(540,659,241,36,C.cream,18)}
${text(560,683,'01 / PREMIERS PAS',16,C.green,700,'letter-spacing="1"')}
${text(535,784,'Ton projet',65,C.ink,700)}
${text(535,855,'commence',65,C.ink,700)}
${text(535,926,'ici.',65,C.ink,700)}
${text(540,988,'Étudier en Allemagne,',29,C.ink)}
${text(540,1027,'étape par étape.',29,C.ink)}
${rect(540,1067,504,106,C.green,14)}
${text(1015,1127,'من تونس لألمانيا، خطوة بخطوة',29,C.white,400,'class="ar" text-anchor="start" lang="ar"')}
${line(550,1220,928,1220,C.green,3)}
${dot(550,1220,7,C.green)}${dot(739,1220,7,C.green)}${dot(928,1220,7,C.green)}
${text(1042,1229,'1 / 7',20,C.ink,400,'text-anchor="end"')}

${rect(1208,552,411,730,C.ink,0)}
${wordmark(1242,619,35,C.white,C.apricot)}
${text(1242,689,'Vrai ou faux ?',23,C.apricot,700)}
${text(1242,764,'Une admission',42,C.white,700)}
${text(1242,821,'= un visa ?',42,C.white,700)}
${rect(1242,866,343,262,C.cream,16)}
${text(1265,935,'Non.',55,C.green,700)}
${text(1265,978,'Deux décisions distinctes.',22,C.ink,700)}
${text(1265,1025,'Admission → université',20,C.ink)}
${text(1265,1065,'Visa → autorités',20,C.ink)}
${text(1323,1094,'compétentes',20,C.ink)}
${text(1242,1198,'Comprendre les étapes.',23,C.white,700)}
${text(1242,1237,'Aucune décision garantie.',19,C.white)}

${line(72,1323,1726,1323,'#CAD2CE',1)}
${text(72,1366,'Mot-symbole conceptuel et gabarits de démonstration · pas un logo officiel ni des publications finales.',21,C.ink)}
${text(1726,1366,'21.09.2026',21,C.ink,400,'text-anchor="end"')}
</svg>`;

const svgPath = path.join(out,'AlmaGo-identite-visuelle.svg');
const pngPath = path.join(out,'AlmaGo-identite-visuelle.png');
await fs.writeFile(svgPath, svg, 'utf8');
await sharp(Buffer.from(svg)).png().toFile(pngPath);
const metadata = await sharp(pngPath).metadata();
console.log(JSON.stringify({ svgPath, pngPath, width: metadata.width, height: metadata.height }));
