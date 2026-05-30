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

$step613Json = Join-Path $OutDir "step613_post_status_update_verification.json"
$step611dJson = Join-Path $OutDir "step611d_fixed_final_completion_verification_v2.json"

if (-not (Test-Path -LiteralPath $step613Json)) { $errors += "Missing STEP613 JSON: " + $step613Json }
if (-not (Test-Path -LiteralPath $step611dJson)) { $errors += "Missing STEP611D JSON: " + $step611dJson }

$step613Ok = $false
$step611dOk = $false
$statusFilesChecked = 0
$statusFilesWithStep612 = 0
$docsChecked = 0
$reportGroupsChecked = 0

if (Test-Path -LiteralPath $step613Json) {
  try {
    $step613 = Get-Content -LiteralPath $step613Json -Raw -Encoding UTF8 | ConvertFrom-Json
    $step613Ok = [bool]$step613.summary.statusVerificationOk
    $statusFilesChecked = [int]$step613.summary.statusFilesChecked
    $statusFilesWithStep612 = [int]$step613.summary.statusFilesWithStep612Section
  } catch {
    $errors += "Could not parse STEP613 JSON: " + $_.Exception.Message
  }
}

if (Test-Path -LiteralPath $step611dJson) {
  try {
    $step611d = Get-Content -LiteralPath $step611dJson -Raw -Encoding UTF8 | ConvertFrom-Json
    $step611dOk = [bool]$step611d.summary.completionOk
    $docsChecked = [int]$step611d.summary.docsChecked
    $reportGroupsChecked = [int]$step611d.summary.reportGroupsChecked
  } catch {
    $errors += "Could not parse STEP611D JSON: " + $_.Exception.Message
  }
}

if (-not $step613Ok) { $warnings += "STEP613 statusVerificationOk is not True." }
if (-not $step611dOk) { $warnings += "STEP611D completionOk is not True." }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$handoffRel = "project-state/STEP614_ROUTE_DOCS_COMPLETION_HANDOFF.md"
$handoffPath = Join-Path $ProjectRoot ($handoffRel.Replace("/", "\"))
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $handoffPath) | Out-Null

$scanPrepRel = "project-state/STEP614_FRESH_SYSTEMSCAN_PREP.md"
$scanPrepPath = Join-Path $ProjectRoot ($scanPrepRel.Replace("/", "\"))
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $scanPrepPath) | Out-Null

$scanScriptRel = "tools/system-inspection/run_fresh_systemscan_after_step614.ps1"
$scanScriptPath = Join-Path $ProjectRoot ($scanScriptRel.Replace("/", "\"))
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $scanScriptPath) | Out-Null

$handoff = @"
# STEP614 - Route-/Modul-Doku-Konsolidierung Abschluss / Uebergabe

Stand: 2026-05-30  
Generated: $timestamp

## Kurzstatus

Die Route-/Modul-Doku-Konsolidierung von STEP591 bis STEP613 ist abgeschlossen.

Finale Pruefungen:

- STEP611D Completion OK: $step611dOk
- STEP613 Status Verification OK: $step613Ok
- Docs checked: $docsChecked
- Report groups checked: $reportGroupsChecked
- Status files checked: $statusFilesChecked
- Status files with STEP612 section: $statusFilesWithStep612

## Was erledigt wurde

1. Backend-Routen wurden gescannt und zentral inventarisiert.
2. Fehlende Route-Erwaehnungen wurden dokumentiert.
3. False-Positive-/Review-Kontext wurde dokumentiert.
4. Modul-Doku-Batches wurden abgearbeitet:
   - ROUTES / zentrale Backend-Routenuebersicht
   - Current Status / Crossmodule
   - Channelpoints
   - Sound System / Channelpoints Routing
   - Dashboard Commands
   - Communication Bus / EventBus Contract
   - Shoutout / Clip Features
5. STEP611A bis STEP611D haben die Abschlussverifikation korrigiert und final bestaetigt.
6. STEP612 hat zentrale Statusdateien aktualisiert.
7. STEP613 hat die Statusdateien final verifiziert.

## Wichtige Ziel-Dokus

- docs/backend/ROUTES.md
- docs/current/CURRENT_SYSTEM_STATUS.md
- docs/modules/channelpoints.md
- docs/modules/sound_system_channelpoints_routing.md
- docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
- docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
- docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
- project-state/CURRENT_STATUS.md
- project-state/NEXT_STEPS.md
- project-state/CHANGELOG.md
- project-state/FILES.md

## Wichtige Reports

- system-scan-output/step611d_fixed_final_completion_verification_v2_summary.txt
- system-scan-output/step611d_fixed_final_completion_verification_v2.json
- system-scan-output/step613_post_status_update_verification_summary.txt
- system-scan-output/step613_post_status_update_verification.json
- system-scan-output/step612_central_status_files_update_summary.txt

## Arbeitsregeln fuer den naechsten Chat

- GitHub/dev und echte lokale Dateien bleiben Single Source of Truth.
- Keine Funktionalitaet entfernen.
- Keine produktive Route aus Scan-Treffern ableiten, ohne echten Code-Kontext zu pruefen.
- Keine DB neu bauen/ueberschreiben.
- Dashboard muss ueber Backend-APIs arbeiten.
- Sound-/Routing-/Communication-Bus-Flows nicht ungeprueft umbauen.
- Doku-Workflow beibehalten: Scan -> Triage -> Plan -> Dryrun -> Apply -> Verification.
- Bei Chatwechsel "dokumentieren und aktualisieren" ernst nehmen: zentrale Dokus aktualisieren.

## Naechste sinnvolle Arbeit

Ein frischer SystemScan nach dieser Konsolidierung, danach auf Basis des neuen Befunds entscheiden:

1. Falls keine groben Doku-Luecken: naechste Feature-/Modul-Linie aus `NEXT_STEPS.md` waehlen.
2. Falls neue Doku-Luecken: erneut mit Scan/Triage/Plan arbeiten.
3. Falls Routen-/Modulstatus stabil: Dashboard-/Admin-/Config-Doku oder konkretes Feature fortsetzen.

## Abschlussstatus

Dieser Stand kann als sauberer Uebergabepunkt fuer den naechsten Chat genutzt werden.
"@

$scanPrep = @"
# STEP614 - Fresh SystemScan Prep

Stand: 2026-05-30  
Generated: $timestamp

## Ziel

Nach Abschluss der Route-/Modul-Doku-Konsolidierung einen frischen SystemScan vorbereiten.

## Vorbereitung

Vor dem Scan:

```powershell
cd D:\Git\stream-control-center
git status --short
```

Dann STEP614 committen:

```powershell
.\stepdone.cmd "STEP614 Add route docs completion handoff and fresh scan prep"
```

## Frischen Scan starten

Dieser STEP legt ein kleines Hilfsscript an:

```text
$scanScriptRel
```

Start:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\$scanScriptRel
```

## Erwartung

Das Script sucht vorhandene SystemScan-Scripte und erzeugt eine kompakte Empfehlung. Es startet nicht blind irgendein unbekanntes Script, wenn mehrere Kandidaten existieren.

## Danach

Den `COPY_THIS_RESULT`-Block aus dem Scan-Prep-Script in den Chat kopieren.
"@

$scanScript = @'
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

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$errors = @()
$warnings = @()

$toolDir = Join-Path $ProjectRoot "tools"
$systemInspectionDir = Join-Path $ProjectRoot "tools\system-inspection"

$candidates = @()
if (Test-Path -LiteralPath $toolDir) {
  $candidates += @(Get-ChildItem -LiteralPath $toolDir -Recurse -File -Include "*.ps1","*.cmd","*.bat" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -match "scan|systemscan|system-scan|inspection|inspect" -and
      $_.FullName -notmatch "step[0-9]+"
    } |
    Sort-Object FullName)
}

$recentStepScanScripts = @()
if (Test-Path -LiteralPath $systemInspectionDir) {
  $recentStepScanScripts = @(Get-ChildItem -LiteralPath $systemInspectionDir -File -Filter "*.ps1" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match "scan|verification|triage" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 25)
}

$repoStatus = ""
try {
  Push-Location $ProjectRoot
  $repoStatus = (git status --short 2>$null) -join "`n"
  Pop-Location
} catch {
  try { Pop-Location } catch {}
  $warnings += "Could not run git status: " + $_.Exception.Message
}

$recommendedAction = ""
if (@($candidates).Count -eq 1) {
  $recommendedAction = "One scan candidate found. Review before running: " + $candidates[0].FullName
} elseif (@($candidates).Count -gt 1) {
  $recommendedAction = "Multiple scan candidates found. Pick the known canonical SystemScan script before running."
} else {
  $recommendedAction = "No canonical fresh SystemScan script found automatically. Use the known project SystemScan workflow or provide the current scan script."
  $warnings += "No canonical fresh SystemScan script found automatically."
}

$summaryPath = Join-Path $OutDir "step614_fresh_systemscan_prep_summary.txt"
$candidatesTsv = Join-Path $OutDir "step614_fresh_systemscan_candidates.tsv"
$recentTsv = Join-Path $OutDir "step614_recent_system_inspection_scripts.tsv"
$jsonPath = Join-Path $OutDir "step614_fresh_systemscan_prep.json"

$candidates | Select-Object Name, FullName, LastWriteTime | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $candidatesTsv -Encoding UTF8
$recentStepScanScripts | Select-Object Name, FullName, LastWriteTime | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $recentTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    scanCandidates = @($candidates).Count
    recentSystemInspectionScripts = @($recentStepScanScripts).Count
    gitStatusLines = @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count
    recommendedAction = $recommendedAction
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  candidates = @($candidates | Select-Object Name, FullName, LastWriteTime)
  recentSystemInspectionScripts = @($recentStepScanScripts | Select-Object Name, FullName, LastWriteTime)
  gitStatusShort = $repoStatus
  warningsList = $warnings
  errorsList = $errors
}
$result | ConvertTo-Json -Depth 8 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP614 Fresh SystemScan Prep Summary"
$summary += "Generated: " + $timestamp
$summary += "Scan candidates: " + @($candidates).Count
$summary += "Recent system-inspection scripts: " + @($recentStepScanScripts).Count
$summary += "Git status lines: " + @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count
$summary += "Recommended action: " + $recommendedAction
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Scan candidates:"
foreach ($c in $candidates) {
  $summary += "- " + $c.FullName
}
$summary += ""
$summary += "Recent system-inspection scripts:"
foreach ($s in $recentStepScanScripts) {
  $summary += "- " + $s.Name
}
$summary += ""
$summary += "Git status --short:"
if ([string]::IsNullOrWhiteSpace($repoStatus)) {
  $summary += "(clean or unavailable)"
} else {
  $summary += $repoStatus
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
Write-Host "STEP614 Fresh SystemScan Prep fertig."
Write-Host ("Scan candidates: " + @($candidates).Count)
Write-Host ("Recent system-inspection scripts: " + @($recentStepScanScripts).Count)
Write-Host ("Git status lines: " + @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count)
Write-Host ("Recommended action: " + $recommendedAction)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Candidates TSV: " + $candidatesTsv)
Write-Host ("Recent scripts TSV: " + $recentTsv)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Scan candidates: " + @($candidates).Count)
Write-Host ("Recent system-inspection scripts: " + @($recentStepScanScripts).Count)
Write-Host ("Git status lines: " + @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count)
Write-Host ("Recommended action: " + $recommendedAction)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
'@

Set-Content -LiteralPath $handoffPath -Value $handoff -Encoding UTF8
Set-Content -LiteralPath $scanPrepPath -Value $scanPrep -Encoding UTF8
Set-Content -LiteralPath $scanScriptPath -Value $scanScript -Encoding UTF8

$summaryPath = Join-Path $OutDir "step614_handoff_and_fresh_systemscan_prep_summary.txt"
$jsonPath = Join-Path $OutDir "step614_handoff_and_fresh_systemscan_prep.json"
$mdPath = Join-Path $OutDir "step614_handoff_and_fresh_systemscan_prep.md"

$createdFiles = @(
  [pscustomobject]@{ file = $handoffRel; purpose = "handoff" },
  [pscustomobject]@{ file = $scanPrepRel; purpose = "fresh-scan-prep" },
  [pscustomobject]@{ file = $scanScriptRel; purpose = "fresh-scan-helper" }
)

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    step611DCompletionOk = $step611dOk
    step613StatusVerificationOk = $step613Ok
    filesCreated = @($createdFiles).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  createdFiles = $createdFiles
  warningsList = $warnings
  errorsList = $errors
}
$result | ConvertTo-Json -Depth 8 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = @()
$md += "# STEP614 Handoff and Fresh SystemScan Prep"
$md += ""
$md += "Generated: " + $timestamp
$md += ""
$md += "## Ergebnis"
$md += ""
$md += "- STEP611D Completion OK: " + $step611dOk
$md += "- STEP613 Status Verification OK: " + $step613Ok
$md += "- Files created: " + @($createdFiles).Count
$md += "- Warnings: " + @($warnings).Count
$md += "- Errors: " + @($errors).Count
$md += ""
$md += "## Dateien"
$md += ""
$md += "| File | Purpose |"
$md += "|---|---|"
foreach ($f in $createdFiles) {
  $md += "| " + $f.file + " | " + $f.purpose + " |"
}
$md += ""
$md += "## Naechster Schritt"
$md += ""
$md += "STEP614 committen, danach Fresh SystemScan Prep Script ausfuehren."
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP614 Handoff and Fresh SystemScan Prep Summary"
$summary += "Generated: " + $timestamp
$summary += "STEP611D Completion OK: " + $step611dOk
$summary += "STEP613 Status Verification OK: " + $step613Ok
$summary += "Files created: " + @($createdFiles).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Created files:"
foreach ($f in $createdFiles) {
  $summary += "- " + $f.file + " | " + $f.purpose
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
Write-Host "STEP614 Handoff and Fresh SystemScan Prep fertig."
Write-Host ("STEP611D Completion OK: " + $step611dOk)
Write-Host ("STEP613 Status Verification OK: " + $step613Ok)
Write-Host ("Files created: " + @($createdFiles).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("STEP611D Completion OK: " + $step611dOk)
Write-Host ("STEP613 Status Verification OK: " + $step613Ok)
Write-Host ("Files created: " + @($createdFiles).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host "Created files:"
foreach ($f in $createdFiles) {
  Write-Host ("- " + $f.file + " | " + $f.purpose)
}
