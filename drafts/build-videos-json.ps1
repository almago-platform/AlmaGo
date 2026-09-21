$ErrorActionPreference = 'Stop'
$basePath = 'C:\Users\tayar\Documents\ChatGPT\AlmaGo\drafts'
$markdownPath = Join-Path $basePath 'videos.md'
$rawText = [IO.File]::ReadAllText($markdownPath, [Text.Encoding]::UTF8)
$sourceById = @{
  V02 = 'Sources vérifiées le 21/09/2026 : [uni-assist — certificats de langue](https://www.uni-assist.de/en/how-to-apply/assemble-your-documents/language-certificates/).'
  V03 = 'Sources vérifiées le 21/09/2026 : [Ambassade d’’Allemagne à Tunis — visas nationaux](https://tunis.diplo.de/tn-fr/service/05-visaeinreise/1672716-1672716) et [études](https://tunis.diplo.de/tn-fr/service/05-visaeinreise/2573172-2573172). Pour la procédure actuelle, suivre la rubrique visas nationaux.'
  V05 = 'Sources vérifiées le 21/09/2026 : [uni-assist — procédure](https://www.uni-assist.de/en/faqs/get-information/) et [VPD](https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/).'
  V06 = 'Sources vérifiées le 21/09/2026 : [DAAD — budget](https://www.daad.de/en/studying-in-germany/living-in-germany/finances/) et [Make it in Germany — visa d’’études](https://www.make-it-in-germany.com/en/visa-residence/types/studying).'
  V07 = 'Source vérifiée le 21/09/2026 : [uni-assist — planifier la candidature](https://www.uni-assist.de/en/faqs/plan-your-application/).'
  V08 = 'Source vérifiée le 21/09/2026 : [uni-assist — langues et justificatifs](https://www.uni-assist.de/en/how-to-apply/assemble-your-documents/language-certificates/).'
}
$rawText = $rawText.Replace('**Vérification nécessaire :** source officielle sur les exigences linguistiques des programmes ; valider toute capture contre la page du programme au jour de la publication.', '**Contrôle avant diffusion :** S09 vérifiée le 21/09/2026. Valider toute capture contre la page du programme au jour de la publication.')
$rawText = $rawText.Replace('**Vérification nécessaire :** rattacher une source officielle allemande récente sur le visa d’’études et la procédure applicable en Tunisie.', '**Contrôle avant diffusion :** S01 et S02 vérifiées le 21/09/2026. Suivre le parcours actuel de l’’Ambassade d’’Allemagne à Tunis.')
$rawText = $rawText.Replace('**Vérification nécessaire :** procédure uni-assist/VPD à confirmer par une source officielle ; captures et consignes du programme à actualiser avant publication.', '**Contrôle avant diffusion :** S04 et S05 vérifiées le 21/09/2026 ; captures et consignes du programme à actualiser avant publication.')
$rawText = $rawText.Replace('**Vérification nécessaire :** cette grille', '**Contrôle avant diffusion :** S03 vérifiée le 21/09/2026. Cette grille')
$rawText = $rawText.Replace('**Vérification nécessaire :** aucune date', '**Contrôle avant diffusion :** S06 vérifiée le 21/09/2026. Aucune date')
$rawText = $rawText.Replace('**Vérification nécessaire :** source DAAD ou université attestant l’’existence de programmes en anglais et la variabilité des exigences.', '**Contrôle avant diffusion :** S09 vérifiée le 21/09/2026 avec uni-assist, qui traite aussi les programmes enseignés en anglais et leurs exigences.')
$sectionMatches = [regex]::Matches($rawText, '(?ms)^### (V0[1-8]) — (.*?)(?=^### V0[1-8] —|^## Livraison|\z)')
foreach ($sectionMatch in $sectionMatches) {
  $id = $sectionMatch.Groups[1].Value
  if ($sourceById.ContainsKey($id) -and -not $sectionMatch.Value.Contains('Source vérifiée le 21/09/2026 :') -and -not $sectionMatch.Value.Contains('Sources vérifiées le 21/09/2026 :')) {
    $sourceLine = $sourceById[$id]
    $updatedSection = [regex]::Replace($sectionMatch.Value, '(?m)^`#', "$sourceLine`n`n" + '`#')
    $rawText = $rawText.Replace($sectionMatch.Value, $updatedSection)
  }
}
[IO.File]::WriteAllText($markdownPath, $rawText, [Text.UTF8Encoding]::new($false))

function Clean-Text([string]$value) {
  return $value.Replace('**', '').Trim().Trim([char[]]'«» ').Trim()
}
function Match-Text([string]$value, [string]$pattern) {
  return [regex]::Match($value, $pattern).Groups[1].Value.Trim()
}
$videos = @()
$sectionMatches = [regex]::Matches($rawText, '(?ms)^### (V0[1-8]) — (.*?)(?=^### V0[1-8] —|^## Livraison|\z)')
foreach ($sectionMatch in $sectionMatches) {
  $block = $sectionMatch.Value
  $id = $sectionMatch.Groups[1].Value
  $title = Match-Text $block '^### V0[1-8] — ([^\r\n]+)'
  $hookIG = Match-Text $block '\*\*Hook Instagram[^*]*\*\*\s*« (.*?) »'
  $hookTT = Match-Text $block '\*\*Hook TikTok[^*]*\*\*\s*« (.*?) »'
  $captionIG = Match-Text $block '(?s)\*\*Caption Instagram[^\r\n]*\*\*\s*\r?\n\s*([^\r\n]+)'
  $captionTT = Match-Text $block '(?s)\*\*Caption TikTok[^\r\n]*\*\*\s*\r?\n\s*([^\r\n]+)'
  if (-not $captionIG) { $captionIG = Match-Text $block '\*\*Instagram :\*\* « (.*?) »' }
  if (-not $captionTT) { $captionTT = Match-Text $block '\*\*TikTok :\*\* « (.*?) »' }
  $captionFB = Match-Text $block 'Caption : « (.*?) »'
  $source = $sourceById[$id]
  $captionIG = Clean-Text $captionIG
  $captionTT = Clean-Text $captionTT
  $captionFB = Clean-Text $captionFB
  if ($source) {
    $captionIG += "`n`n$source"
    $captionTT += "`n`n$source"
    $captionFB += "`n`n$source"
  }
  $hashMatches = [regex]::Matches($block, '(?m)^`(#[^`]+)`')
  $rows = @()
  foreach ($rowMatch in [regex]::Matches($block, '(?m)^\|\s*\d[^\r\n]+')) {
    $cells = $rowMatch.Value.Split('|') | ForEach-Object { $_.Trim() }
    $voice = Clean-Text $cells[2]
    if ($voice -eq 'Hook de la plateforme.') { continue }
    $rows += [pscustomobject]@{time=$cells[1];voiceover=$voice;screen=(Clean-Text $cells[3]);visual=$(if($cells.Count -ge 6){Clean-Text $cells[4]}else{Clean-Text $cells[3]})}
  }
  $validation = Match-Text $block '\*\*(?:Statut|Contrôle avant diffusion) :\*\* ([^\r\n]+)'
  $videos += [pscustomobject][ordered]@{
    id=$id
    title=$title
    duration=(Match-Text $block '\*\*Durée cible :\*\* ([^·\r\n]+)')
    hookIG=$hookIG
    hookTT=$hookTT
    voiceover=($rows.voiceover -join "`n")
    screen=(($rows | ForEach-Object { "$($_.time) — $($_.screen)" }) -join "`n")
    visual=(($rows | ForEach-Object { "$($_.time) — $($_.visual)" }) -join "`n")
    captionIG=$captionIG
    captionTT=$captionTT
    captionFB=$captionFB
    hashtagsIG=$hashMatches[0].Groups[1].Value
    hashtagsTT=$hashMatches[1].Groups[1].Value
    hashtagsFB=$hashMatches[2].Groups[1].Value
    cta=(Match-Text $block '\*\*CTA(?: principal)? :\*\* ([^·\r\n]+)')
    validation=$validation
    sources=$source
    timeline=$rows
  }
}
if ($videos.Count -ne 8) { throw "Expected 8 videos, got $($videos.Count)." }
foreach ($video in $videos) {
  foreach ($field in 'id','title','duration','hookIG','hookTT','voiceover','screen','visual','captionIG','captionTT','captionFB','hashtagsIG','hashtagsTT','hashtagsFB','cta','validation') {
    if (-not $video.$field) { throw "Missing $field for $($video.id)." }
  }
}
$json = ConvertTo-Json -InputObject $videos -Depth 8
[IO.File]::WriteAllText((Join-Path $basePath 'videos.json'), $json, [Text.UTF8Encoding]::new($false))
$videos | Select-Object id,title,duration,cta,@{Name='VoiceoverWords';Expression={($_.voiceover -split '\s+').Count}} | Format-Table -AutoSize
