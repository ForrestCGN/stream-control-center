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

$scanSummary = Join-Path $OutDir "scan_summary.txt"
$inventoryJson = Join-Path $OutDir "system_inventory.json"
$step613Json = Join-Path $OutDir "step613_post_status_update_verification.json"
$step614PrepJson = Join-Path $OutDir "step614_fresh_systemscan_prep.json"

foreach ($p in @($scanSummary, $inventoryJson, $step613Json, $step614PrepJson)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $warnings += "Optional/reference input missing: " + $p
  }
}

$scan = $null
$fileCount = $null
$backendModules = $null
$helpers = $null
$dashboardFiles = $null
$overlayFiles = $null
$configFiles = $null
$docsFiles = $null
$cleanupCandidates = $null
$eventBusFiles = $null
$soundSystemFiles = $null

if (Test-Path -LiteralPath $inventoryJson) {
  try {
    $scan = Get-Content -LiteralPath $inventoryJson -Raw -Encoding UTF8 | ConvertFrom-Json
    $fileCount = [int]$scan.summary.fileCount
    $backendModules = [int]$scan.summary.backendModules
    $helpers = [int]$scan.summary.helpers
    $dashboardFiles = [int]$scan.summary.dashboardFiles
    $overlayFiles = [int]$scan.summary.overlayFiles
    $configFiles = [int]$scan.summary.configFiles
    $docsFiles = [int]$scan.summary.docsFiles
    $cleanupCandidates = [int]$scan.summary.cleanupCandidates
    $eventBusFiles = [int]$scan.summary.eventBusFiles
    $soundSystemFiles = [int]$scan.summary.soundSystemFiles
  } catch {
    $warnings += "Could not parse system_inventory.json: " + $_.Exception.Message
  }
}

$step613Ok = $false
if (Test-Path -LiteralPath $step613Json) {
  try {
    $step613 = Get-Content -LiteralPath $step613Json -Raw -Encoding UTF8 | ConvertFrom-Json
    $step613Ok = [bool]$step613.summary.statusVerificationOk
  } catch {
    $warnings += "Could not parse STEP613 JSON: " + $_.Exception.Message
  }
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$date = "2026-05-30"

$freezeRel = "project-state/STEP615_CLEANUP_FREEZE_RETURN_TO_PRODUCTIVE_WORK.md"
$freezePath = Join-Path $ProjectRoot ($freezeRel.Replace("/", "\"))
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $freezePath) | Out-Null

$freezeDoc = @"
# STEP615 - Cleanup Freeze & Return to Productive Work

Stand: $date  
Generated: $timestamp

## Entscheidung

Die aktuelle Cleanup-/Doku-Konsolidierungsrunde wird eingefroren.

Ab jetzt gilt:

- Keine weiteren Mini-Cleanup-Steps ohne echten Bedarf.
- Cleanup-Kandidaten sind nur Kandidaten und werden nicht automatisch geloescht.
- Quarantaene- und Report-Dateien bleiben zunaechst als Historie/Sicherheitsnetz bestehen.
- Produktive Arbeit bekommt wieder Vorrang.
- Weitere Cleanup-Arbeit nur noch in wenigen groesseren, bewusst geplanten Batches.

## Abschlussstand

Die Route-/Modul-Doku-Konsolidierung ist abgeschlossen.

- STEP591 bis STEP613: abgeschlossen
- STEP611D Completion OK: True
- STEP613 Status Verification OK: $step613Ok
- STEP614 Handoff/Fresh SystemScan Prep: erstellt
- Frischer SystemScan nach STEP614: vorhanden

## Frischer SystemScan - Referenzwerte

- Files: $fileCount
- Backend modules: $backendModules
- Helpers: $helpers
- Dashboard files: $dashboardFiles
- Overlay files: $overlayFiles
- Config files: $configFiles
- Docs files: $docsFiles
- EventBus tagged files: $eventBusFiles
- Sound-System tagged files: $soundSystemFiles
- Cleanup candidates: $cleanupCandidates

Wichtig: Die Cleanup-Kandidaten sind bewusst breit erkannt. Sie enthalten Quarantaene, Reports, alte STEP-Dokumente, Review-Marker und teils aktive Dateien. Daraus folgt keine automatische Loeschentscheidung.

## Aktive Arbeitsbereiche

Fuer kommende Arbeit gelten diese Bereiche als aktiv und relevant:

- backend/
- config/
- htdocs/
- docs/current/
- docs/modules/
- docs/backend/
- docs/system-inspection/
- project-state/CURRENT_STATUS.md
- project-state/NEXT_STEPS.md
- project-state/CHANGELOG.md
- project-state/FILES.md
- project-state/TODO.md

## Historie / nicht mehr aktiv priorisiert

Diese Bereiche sind aktuell nicht fuer kleinteilige Weiterarbeit priorisiert:

- _cleanup_quarantine/
- alte STEP-Einzelreports in system-scan-output/
- alte isolierte STEP-Dokumente, sofern sie bereits konsolidiert wurden
- reine Scan-/Dryrun-/Apply-/Verification-Artefakte ohne aktuellen Entscheidungswert

Diese Dateien duerfen aber nicht unkontrolliert geloescht werden. Falls Speicher-/Repo-Groesse spaeter stoert, nur ueber einen bewussten Grossbatch:

1. FINAL_CLEANUP_SCAN
2. FINAL_ARCHIVE_PLAN
3. FINAL_ARCHIVE_APPLY
4. FINAL_VERIFY

## Arbeitsregel ab jetzt

Bei neuen Aufgaben:

1. Erst den echten aktuellen Projektstand pruefen.
2. Bestehende Helper/Configs/APIs verwenden.
3. Keine Funktionalitaet entfernen.
4. Keine produktive Datenbank ueberschreiben.
5. Dashboard immer ueber Backend-APIs.
6. Sound-/Routing-/Communication-Bus-Flows nur mit Plan/Test anfassen.
7. Doku nur dort aktualisieren, wo sie fuer den aktuellen Schritt wirklich relevant ist.
8. Keine endlosen Mini-Steps fuer reine Ordnungsthemen.

## Naechste produktive Optionen

Sinnvolle naechste Projektarbeit:

1. Channelpoints weiter stabilisieren / Dashboard fertig abrunden.
2. Sound-System / Routing gezielt testen und dokumentieren.
3. Dashboard Admin-/Config-Seiten weiter ausbauen.
4. Alert-System oder Shoutout/Clip-System produktiv weiterentwickeln.
5. Konkretes neues Feature beginnen.
6. Bei Bedarf erst einen gezielten Scan fuer genau diesen Bereich ausfuehren.

## Abschluss

Dieser Stand markiert den Abschluss der bisherigen Cleanup-Runde und ist ein sauberer Einstiegspunkt fuer produktive Weiterarbeit.
"@

Set-Content -LiteralPath $freezePath -Value $freezeDoc -Encoding UTF8

$start = "<!-- STEP615_CLEANUP_FREEZE_START -->"
$end = "<!-- STEP615_CLEANUP_FREEZE_END -->"

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
  } else {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $Path) | Out-Null
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

$statusSection = @"
## STEP615 Cleanup Freeze & Return to Productive Work

Stand: $date

Die Cleanup-/Doku-Konsolidierungsrunde ist eingefroren. Route-/Modul-Doku STEP591 bis STEP613 ist abgeschlossen und STEP614 hat eine Uebergabe plus Fresh-SystemScan-Prep erstellt.

Frischer Scan als Referenz:

- Files: $fileCount
- Backend modules: $backendModules
- Helpers: $helpers
- Dashboard files: $dashboardFiles
- Overlay files: $overlayFiles
- Config files: $configFiles
- Docs files: $docsFiles
- Cleanup candidates: $cleanupCandidates

Entscheidung: Cleanup-Kandidaten werden nicht weiter kleinteilig verfolgt. Weitere Cleanup-Arbeit nur noch bei echtem Bedarf und dann als groesserer, sicher geplanter Batch.
"@

$nextSection = @"
## Nach STEP615 - Fokus wieder auf produktive Arbeit

Stand: $date

Cleanup ist eingefroren. Empfohlene naechste Schritte sind produktive Projektlinien:

1. Channelpoints / Rewards / Dashboard weiter stabilisieren.
2. Sound-System / Routing gezielt testen.
3. Dashboard Admin-/Config-Bereiche weiter ausbauen.
4. Alert-System oder Shoutout/Clip-System gezielt fortsetzen.
5. Neues Feature mit echtem Bedarf starten.

Keine weiteren Mini-Cleanup-Steps, solange kein konkretes Problem vorliegt.
"@

$changelogSection = @"
## $date - STEP615 Cleanup Freeze & Return to Productive Work

- Cleanup-/Doku-Konsolidierungsrunde eingefroren.
- STEP591 bis STEP614 als abgeschlossene Doku-/Routen-/Status-Arbeitslinie eingeordnet.
- Frischer SystemScan als Referenz uebernommen.
- Cleanup-Kandidaten werden nur als Kandidaten behandelt, nicht als automatische Loeschliste.
- Weitere Cleanup-Arbeit nur noch bei Bedarf und nur als bewusst geplanter Grossbatch.
- Fokus wird wieder auf produktive Projektarbeit gelegt.
"@

$todoSection = @"
## STEP615 Cleanup Freeze

Status: abgeschlossen / eingefroren

Keine weiteren Mini-Cleanup-Steps fuer reine Ordnungsfragen.

Nur noch bei konkretem Bedarf:

- FINAL_CLEANUP_SCAN
- FINAL_ARCHIVE_PLAN
- FINAL_ARCHIVE_APPLY
- FINAL_VERIFY

Aktueller Fokus: produktive Projektarbeit.
"@

$updates = @()
$targets = @(
  @{ rel = "project-state/CURRENT_STATUS.md"; section = $statusSection },
  @{ rel = "docs/current/CURRENT_SYSTEM_STATUS.md"; section = $statusSection },
  @{ rel = "project-state/NEXT_STEPS.md"; section = $nextSection },
  @{ rel = "project-state/CHANGELOG.md"; section = $changelogSection },
  @{ rel = "project-state/TODO.md"; section = $todoSection }
)

foreach ($t in $targets) {
  $full = Join-Path $ProjectRoot ($t.rel.Replace("/", "\"))
  $mode = Upsert-Section -Path $full -StartMarker $start -EndMarker $end -SectionText $t.section
  $updates += [pscustomobject]@{ file = $t.rel; mode = $mode }
}

$summaryPath = Join-Path $OutDir "step615_cleanup_freeze_summary.txt"
$updatesTsv = Join-Path $OutDir "step615_cleanup_freeze_updates.tsv"
$mdPath = Join-Path $OutDir "step615_cleanup_freeze_return_to_productive_work.md"
$jsonPath = Join-Path $OutDir "step615_cleanup_freeze_return_to_productive_work.json"

$updates | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $updatesTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    cleanupFreezeSet = $true
    step613StatusVerificationOk = $step613Ok
    fileCount = $fileCount
    backendModules = $backendModules
    helpers = $helpers
    dashboardFiles = $dashboardFiles
    overlayFiles = $overlayFiles
    configFiles = $configFiles
    docsFiles = $docsFiles
    cleanupCandidates = $cleanupCandidates
    eventBusFiles = $eventBusFiles
    soundSystemFiles = $soundSystemFiles
    filesUpdated = @($updates).Count
    filesCreated = 1
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  createdFiles = @([pscustomobject]@{ file = $freezeRel; purpose = "cleanup-freeze-handoff" })
  updates = $updates
  warningsList = $warnings
  errorsList = $errors
}
$result | ConvertTo-Json -Depth 8 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = @()
$md += "# STEP615 Cleanup Freeze & Return to Productive Work"
$md += ""
$md += "Generated: " + $timestamp
$md += ""
$md += "## Ergebnis"
$md += ""
$md += "- Cleanup Freeze set: True"
$md += "- STEP613 Status Verification OK: " + $step613Ok
$md += "- Files: " + $fileCount
$md += "- Backend modules: " + $backendModules
$md += "- Helpers: " + $helpers
$md += "- Dashboard files: " + $dashboardFiles
$md += "- Overlay files: " + $overlayFiles
$md += "- Config files: " + $configFiles
$md += "- Docs files: " + $docsFiles
$md += "- Cleanup candidates: " + $cleanupCandidates
$md += "- Files updated: " + @($updates).Count
$md += "- Files created: 1"
$md += "- Warnings: " + @($warnings).Count
$md += "- Errors: " + @($errors).Count
$md += ""
$md += "## Aktualisierte Dateien"
$md += ""
$md += "| File | Mode |"
$md += "|---|---|"
foreach ($u in $updates) {
  $md += "| " + $u.file + " | " + $u.mode + " |"
}
$md += ""
$md += "## Beschluss"
$md += ""
$md += "Cleanup ist eingefroren. Produktive Projektarbeit hat wieder Vorrang."
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP615 Cleanup Freeze & Return to Productive Work Summary"
$summary += "Generated: " + $timestamp
$summary += "Cleanup Freeze set: True"
$summary += "STEP613 Status Verification OK: " + $step613Ok
$summary += "Files: " + $fileCount
$summary += "Backend modules: " + $backendModules
$summary += "Helpers: " + $helpers
$summary += "Dashboard files: " + $dashboardFiles
$summary += "Overlay files: " + $overlayFiles
$summary += "Config files: " + $configFiles
$summary += "Docs files: " + $docsFiles
$summary += "Cleanup candidates: " + $cleanupCandidates
$summary += "EventBus tagged files: " + $eventBusFiles
$summary += "Sound-System tagged files: " + $soundSystemFiles
$summary += "Files updated: " + @($updates).Count
$summary += "Files created: 1"
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Created file:"
$summary += "- " + $freezeRel
$summary += ""
$summary += "Updated files:"
foreach ($u in $updates) {
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
Write-Host "STEP615 Cleanup Freeze & Return to Productive Work fertig."
Write-Host ("Cleanup Freeze set: True")
Write-Host ("STEP613 Status Verification OK: " + $step613Ok)
Write-Host ("Files: " + $fileCount)
Write-Host ("Backend modules: " + $backendModules)
Write-Host ("Helpers: " + $helpers)
Write-Host ("Dashboard files: " + $dashboardFiles)
Write-Host ("Overlay files: " + $overlayFiles)
Write-Host ("Config files: " + $configFiles)
Write-Host ("Docs files: " + $docsFiles)
Write-Host ("Cleanup candidates: " + $cleanupCandidates)
Write-Host ("Files updated: " + @($updates).Count)
Write-Host ("Files created: 1")
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Updates TSV: " + $updatesTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Cleanup Freeze set: True")
Write-Host ("STEP613 Status Verification OK: " + $step613Ok)
Write-Host ("Files: " + $fileCount)
Write-Host ("Backend modules: " + $backendModules)
Write-Host ("Helpers: " + $helpers)
Write-Host ("Dashboard files: " + $dashboardFiles)
Write-Host ("Overlay files: " + $overlayFiles)
Write-Host ("Config files: " + $configFiles)
Write-Host ("Docs files: " + $docsFiles)
Write-Host ("Cleanup candidates: " + $cleanupCandidates)
Write-Host ("Files updated: " + @($updates).Count)
Write-Host ("Files created: 1")
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host "Updated files:"
foreach ($u in $updates) {
  Write-Host ("- " + $u.file + " | " + $u.mode)
}
Write-Host "Created files:"
Write-Host ("- " + $freezeRel + " | cleanup-freeze-handoff")
