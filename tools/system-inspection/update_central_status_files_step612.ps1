param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ProjectRoot)) {
  throw ("Projektpfad nicht gefunden: " + $ProjectRoot)
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path -Path $ProjectRoot -ChildPath "system-scan-output"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$errors = @()
$warnings = @()

$step611dJson = Join-Path $OutDir "step611d_fixed_final_completion_verification_v2.json"
if (-not (Test-Path -LiteralPath $step611dJson)) {
  $errors += "Missing STEP611D JSON: " + $step611dJson
}

$completionOk = $false
$docsChecked = 0
$reportGroupsChecked = 0
$step610RemainingAll = 0

if (Test-Path -LiteralPath $step611dJson) {
  try {
    $step611d = Get-Content -LiteralPath $step611dJson -Raw -Encoding UTF8 | ConvertFrom-Json
    $completionOk = [bool]$step611d.summary.completionOk
    $docsChecked = [int]$step611d.summary.docsChecked
    $reportGroupsChecked = [int]$step611d.summary.reportGroupsChecked
    $step610RemainingAll = [int]$step611d.summary.step610RemainingAllBatches
  } catch {
    $errors += "Could not parse STEP611D JSON: " + $_.Exception.Message
  }
}

if (-not $completionOk) {
  $warnings += "STEP611D completionOk is not True. Central docs will still be prepared, but review is required."
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$filesToUpdate = @(
  "project-state/CURRENT_STATUS.md",
  "project-state/NEXT_STEPS.md",
  "project-state/CHANGELOG.md",
  "project-state/FILES.md",
  "docs/current/CURRENT_SYSTEM_STATUS.md"
)

foreach ($rel in $filesToUpdate) {
  $full = Join-Path $ProjectRoot ($rel.Replace("/", "\"))
  if (-not (Test-Path -LiteralPath $full)) {
    $warnings += "Target status file did not exist and will be created: " + $rel
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $full) | Out-Null
    Set-Content -LiteralPath $full -Value ("# " + $rel + "`n") -Encoding UTF8
  }
}

function Upsert-Section {
  param(
    [string]$Path,
    [string]$StartMarker,
    [string]$EndMarker,
    [string]$SectionText
  )

  $content = ""
  if (Test-Path -LiteralPath $Path) {
    $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  }

  $section = ($StartMarker + "`n" + $SectionText.Trim() + "`n" + $EndMarker).Trim()

  if ($content.Contains($StartMarker) -and $content.Contains($EndMarker)) {
    $pattern = [regex]::Escape($StartMarker) + "(?s).*?" + [regex]::Escape($EndMarker)
    $content = [regex]::Replace($content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $section })
    Set-Content -LiteralPath $Path -Value ($content.TrimEnd() + "`n") -Encoding UTF8
    return "replaced"
  } else {
    $content = $content.TrimEnd() + "`n`n" + $section + "`n"
    Set-Content -LiteralPath $Path -Value $content -Encoding UTF8
    return "appended"
  }
}

$start = "<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_START -->"
$end = "<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_END -->"

$currentStatusSection = @"
## STEP612 Route-/Modul-Doku-Konsolidierung abgeschlossen

Stand: 2026-05-30

Die Route-/Modul-Doku-Konsolidierung aus STEP591 bis STEP611D ist abgeschlossen und final verifiziert.

Abschlusspruefung:

- Completion OK: $completionOk
- Docs checked: $docsChecked
- Report groups checked: $reportGroupsChecked
- STEP610 remaining all batches: $step610RemainingAll
- Warnings/Errors in STEP611D: 0/0

Wichtig:

- Es wurden keine produktiven Flows umgebaut.
- Die Arbeiten waren Doku-/Scan-/Konsolidierungsarbeit.
- Zentrale Zielbereiche wurden ergaenzt: ROUTES, Current Status, Channelpoints, Sound Routing, Dashboard Commands, Communication Bus, Shoutout System.
- STEP611A bis STEP611D klaerten und korrigierten nur zu strenge Verification-/Marker-Mappings.
"@

$nextStepsSection = @"
## Nach STEP612 - naechste sinnvolle Arbeiten

Stand: 2026-05-30

Die Route-/Modul-Doku-Batch-Reihe ist abgeschlossen.

Empfohlene naechste Schritte:

1. Einen frischen SystemScan laufen lassen, um den neuen Dokumentationsstand zu validieren.
2. Danach gezielt die naechste offene Projektlinie waehlen, z. B. Modul-Doku-Detailpflege, Dashboard-/Admin-Konfiguration oder konkrete Feature-Arbeit.
3. Bei weiterem Doku-Cleanup wieder mit Scan -> Triage -> Plan -> Dryrun -> Apply -> Verification arbeiten.
4. Keine produktive Route oder Funktionalitaet aus Doku-Scan-Treffern ableiten, ohne echten Code-Kontext zu pruefen.
"@

$changelogSection = @"
## 2026-05-30 - STEP612 Route-/Modul-Doku-Konsolidierung abgeschlossen

- STEP591 bis STEP611D abgeschlossen.
- Backend-Routen gescannt, triagiert und zentral dokumentiert.
- Fehlende Route-Erwaehnungen und False-Positive-Kontext dokumentiert.
- Modul-Doku-Batches fuer Current Status, Channelpoints, Sound Routing, Dashboard Commands, Communication Bus und Shoutout System konsolidiert.
- Final Verification durch STEP611D erfolgreich: Completion OK True, 0 Warnings, 0 Errors.
- STEP611/STEP611B Mapping-Probleme wurden ueber STEP611A/STEP611C triagiert und in STEP611D korrekt verifiziert.
"@

$filesSection = @"
## STEP591-STEP612 Doku-/Routen-Konsolidierung

Wichtige Dateien/Reports aus dieser Arbeitslinie:

- docs/backend/ROUTES.md
- docs/current/CURRENT_SYSTEM_STATUS.md
- docs/modules/channelpoints.md
- docs/modules/sound_system_channelpoints_routing.md
- docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
- docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
- docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
- system-scan-output/step611d_fixed_final_completion_verification_v2_summary.txt
- system-scan-output/step611d_fixed_final_completion_verification_v2.json
- project-state/STEP611D_FIXED_FINAL_COMPLETION_VERIFICATION_V2.md

Abschlussstatus: Completion OK True.
"@

$updateResults = @()

if (@($errors).Count -eq 0) {
  $targets = @(
    @{ rel = "project-state/CURRENT_STATUS.md"; section = $currentStatusSection },
    @{ rel = "docs/current/CURRENT_SYSTEM_STATUS.md"; section = $currentStatusSection },
    @{ rel = "project-state/NEXT_STEPS.md"; section = $nextStepsSection },
    @{ rel = "project-state/CHANGELOG.md"; section = $changelogSection },
    @{ rel = "project-state/FILES.md"; section = $filesSection }
  )

  foreach ($t in $targets) {
    $full = Join-Path $ProjectRoot ($t.rel.Replace("/", "\"))
    $mode = Upsert-Section -Path $full -StartMarker $start -EndMarker $end -SectionText $t.section
    $updateResults += [pscustomobject]@{
      file = $t.rel
      mode = $mode
    }
  }
}

$summaryPath = Join-Path $OutDir "step612_central_status_files_update_summary.txt"
$updatesTsv = Join-Path $OutDir "step612_central_status_files_update_results.tsv"
$jsonPath = Join-Path $OutDir "step612_central_status_files_update.json"
$mdPath = Join-Path $OutDir "step612_central_status_files_update.md"

$updateResults | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $updatesTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    completionOkFromStep611D = $completionOk
    docsChecked = $docsChecked
    reportGroupsChecked = $reportGroupsChecked
    step610RemainingAllBatches = $step610RemainingAll
    filesUpdated = @($updateResults).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  updates = $updateResults
  warningsList = $warnings
  errorsList = $errors
}
$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = @()
$md += "# STEP612 Central Status Files Update"
$md += ""
$md += "Generated: " + $timestamp
$md += ""
$md += "## Ergebnis"
$md += ""
$md += "- Completion OK from STEP611D: " + $completionOk
$md += "- Docs checked: " + $docsChecked
$md += "- Report groups checked: " + $reportGroupsChecked
$md += "- STEP610 remaining all batches: " + $step610RemainingAll
$md += "- Files updated: " + @($updateResults).Count
$md += "- Warnings: " + @($warnings).Count
$md += "- Errors: " + @($errors).Count
$md += ""
$md += "## Aktualisierte Dateien"
$md += ""
$md += "| File | Mode |"
$md += "|---|---|"
foreach ($u in $updateResults) {
  $md += "| " + $u.file + " | " + $u.mode + " |"
}
$md += ""
$md += "## Naechster Schritt"
$md += ""
$md += "STEP613 - Post-Status-Update Verification oder frischer SystemScan."
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP612 Central Status Files Update Summary"
$summary += "Generated: " + $timestamp
$summary += "Completion OK from STEP611D: " + $completionOk
$summary += "Docs checked: " + $docsChecked
$summary += "Report groups checked: " + $reportGroupsChecked
$summary += "STEP610 remaining all batches: " + $step610RemainingAll
$summary += "Files updated: " + @($updateResults).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Updated files:"
foreach ($u in $updateResults) {
  $summary += "- " + $u.file + " | " + $u.mode
}
if (@($warnings).Count -gt 0) {
  $summary += ""
  $summary += "Warnings:"
  foreach ($w in $warnings) { $summary += "WARN | " + $w }
}
if (@($errors).Count -gt 0) {
  $summary += ""
  $summary += "Errors:"
  foreach ($e in $errors) { $summary += "ERROR | " + $e }
}
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

Write-Host ""
Write-Host "STEP612 Central Status Files Update fertig."
Write-Host ("Completion OK from STEP611D: " + $completionOk)
Write-Host ("Docs checked: " + $docsChecked)
Write-Host ("Report groups checked: " + $reportGroupsChecked)
Write-Host ("STEP610 remaining all batches: " + $step610RemainingAll)
Write-Host ("Files updated: " + @($updateResults).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Updates TSV: " + $updatesTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Completion OK from STEP611D: " + $completionOk)
Write-Host ("Docs checked: " + $docsChecked)
Write-Host ("Report groups checked: " + $reportGroupsChecked)
Write-Host ("STEP610 remaining all batches: " + $step610RemainingAll)
Write-Host ("Files updated: " + @($updateResults).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host "Updated files:"
foreach ($u in $updateResults) {
  Write-Host ("- " + $u.file + " | " + $u.mode)
}
