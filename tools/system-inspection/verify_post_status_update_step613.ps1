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
$step612Json = Join-Path $OutDir "step612_central_status_files_update.json"

if (-not (Test-Path -LiteralPath $step611dJson)) { $errors += "Missing STEP611D JSON: " + $step611dJson }
if (-not (Test-Path -LiteralPath $step612Json)) { $errors += "Missing STEP612 JSON: " + $step612Json }

$completionOk = $false
$step611dWarnings = $null
$step611dErrors = $null

if (Test-Path -LiteralPath $step611dJson) {
  try {
    $step611d = Get-Content -LiteralPath $step611dJson -Raw -Encoding UTF8 | ConvertFrom-Json
    $completionOk = [bool]$step611d.summary.completionOk
    $step611dWarnings = [int]$step611d.summary.warnings
    $step611dErrors = [int]$step611d.summary.errors
  } catch {
    $errors += "Could not parse STEP611D JSON: " + $_.Exception.Message
  }
}

$step612CompletionOk = $false
$step612FilesUpdated = 0
$step612Warnings = $null
$step612Errors = $null

if (Test-Path -LiteralPath $step612Json) {
  try {
    $step612 = Get-Content -LiteralPath $step612Json -Raw -Encoding UTF8 | ConvertFrom-Json
    $step612CompletionOk = [bool]$step612.summary.completionOkFromStep611D
    $step612FilesUpdated = [int]$step612.summary.filesUpdated
    $step612Warnings = [int]$step612.summary.warnings
    $step612Errors = [int]$step612.summary.errors
  } catch {
    $errors += "Could not parse STEP612 JSON: " + $_.Exception.Message
  }
}

$targetFiles = @(
  "project-state/CURRENT_STATUS.md",
  "docs/current/CURRENT_SYSTEM_STATUS.md",
  "project-state/NEXT_STEPS.md",
  "project-state/CHANGELOG.md",
  "project-state/FILES.md"
)

$start = "<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_START -->"
$end = "<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_END -->"

$fileChecks = @()
foreach ($rel in $targetFiles) {
  $full = Join-Path $ProjectRoot ($rel.Replace("/", "\"))
  $exists = Test-Path -LiteralPath $full
  $hasStart = $false
  $hasEnd = $false
  $hasCompletionText = $false

  if ($exists) {
    $content = Get-Content -LiteralPath $full -Raw -Encoding UTF8
    $hasStart = $content.Contains($start)
    $hasEnd = $content.Contains($end)
    $hasCompletionText = ($content.Contains("Route-/Modul-Doku") -or $content.Contains("Route-/Modul-Doku-Konsolidierung") -or $content.Contains("Completion OK"))
  } else {
    $errors += "Missing target file: " + $rel
  }

  if (-not ($exists -and $hasStart -and $hasEnd)) {
    $warnings += "Missing STEP612 marker section in: " + $rel
  }

  $fileChecks += [pscustomobject]@{
    file = $rel
    exists = $exists
    hasStartMarker = $hasStart
    hasEndMarker = $hasEnd
    hasCompletionText = $hasCompletionText
    ok = ($exists -and $hasStart -and $hasEnd)
  }
}

$allFilesHaveStep612 = (@($fileChecks | Where-Object { -not $_.ok }).Count -eq 0)
$statusVerificationOk = ($completionOk -and $step612CompletionOk -and $allFilesHaveStep612 -and ($step611dWarnings -eq 0) -and ($step611dErrors -eq 0) -and ($step612Warnings -eq 0) -and ($step612Errors -eq 0) -and (@($errors).Count -eq 0))

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step613_post_status_update_verification_summary.txt"
$fileChecksTsv = Join-Path $OutDir "step613_status_file_checks.tsv"
$mdPath = Join-Path $OutDir "step613_post_status_update_verification.md"
$jsonPath = Join-Path $OutDir "step613_post_status_update_verification.json"

$fileChecks | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $fileChecksTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    step611DCompletionOk = $completionOk
    step611DWarnings = $step611dWarnings
    step611DErrors = $step611dErrors
    step612CompletionOkFromStep611D = $step612CompletionOk
    step612FilesUpdated = $step612FilesUpdated
    step612Warnings = $step612Warnings
    step612Errors = $step612Errors
    statusFilesChecked = @($fileChecks).Count
    statusFilesWithStep612Section = @($fileChecks | Where-Object { $_.ok }).Count
    allStatusFilesHaveStep612Section = $allFilesHaveStep612
    statusVerificationOk = $statusVerificationOk
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  fileChecks = $fileChecks
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP613 Post-Status-Update Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Status Verification OK: " + $statusVerificationOk)
$md.Add("STEP611D Completion OK: " + $completionOk)
$md.Add("STEP612 Completion OK from STEP611D: " + $step612CompletionOk)
$md.Add("Status files checked: " + @($fileChecks).Count)
$md.Add("Status files with STEP612 section: " + @($fileChecks | Where-Object { $_.ok }).Count)
$md.Add("All status files have STEP612 section: " + $allFilesHaveStep612)
$md.Add("")
$md.Add("## Datei-Pruefung")
$md.Add("")
$md.Add("| File | Exists | Start marker | End marker | OK |")
$md.Add("|---|---:|---:|---:|---:|")
foreach ($f in $fileChecks) {
  $md.Add("| " + $f.file + " | " + $f.exists + " | " + $f.hasStartMarker + " | " + $f.hasEndMarker + " | " + $f.ok + " |")
}
$md.Add("")
$md.Add("## Abschluss")
$md.Add("")
if ($statusVerificationOk) {
  $md.Add("STEP591 bis STEP613 sind abgeschlossen. Die Route-/Modul-Doku-Konsolidierung ist technisch und zentral dokumentiert verifiziert.")
  $md.Add("")
  $md.Add("Empfehlung: STEP614 - Abschluss-/Uebergabe-Datei oder frischer SystemScan.")
} else {
  $md.Add("Status Verification ist noch nicht sauber. Bitte Warnings/Errors pruefen.")
}
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP613 Post-Status-Update Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "STEP611D Completion OK: " + $completionOk
$summary += "STEP611D warnings/errors: " + $step611dWarnings + "/" + $step611dErrors
$summary += "STEP612 Completion OK from STEP611D: " + $step612CompletionOk
$summary += "STEP612 files updated: " + $step612FilesUpdated
$summary += "STEP612 warnings/errors: " + $step612Warnings + "/" + $step612Errors
$summary += "Status files checked: " + @($fileChecks).Count
$summary += "Status files with STEP612 section: " + @($fileChecks | Where-Object { $_.ok }).Count
$summary += "All status files have STEP612 section: " + $allFilesHaveStep612
$summary += "Status Verification OK: " + $statusVerificationOk
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Checked files:"
foreach ($f in $fileChecks) {
  $summary += "- " + $f.file + " | ok=" + $f.ok
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
Write-Host "STEP613 Post-Status-Update Verification fertig."
Write-Host ("STEP611D Completion OK: " + $completionOk)
Write-Host ("STEP611D warnings/errors: " + $step611dWarnings + "/" + $step611dErrors)
Write-Host ("STEP612 Completion OK from STEP611D: " + $step612CompletionOk)
Write-Host ("STEP612 files updated: " + $step612FilesUpdated)
Write-Host ("STEP612 warnings/errors: " + $step612Warnings + "/" + $step612Errors)
Write-Host ("Status files checked: " + @($fileChecks).Count)
Write-Host ("Status files with STEP612 section: " + @($fileChecks | Where-Object { $_.ok }).Count)
Write-Host ("All status files have STEP612 section: " + $allFilesHaveStep612)
Write-Host ("Status Verification OK: " + $statusVerificationOk)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("File checks TSV: " + $fileChecksTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("STEP611D Completion OK: " + $completionOk)
Write-Host ("STEP611D warnings/errors: " + $step611dWarnings + "/" + $step611dErrors)
Write-Host ("STEP612 Completion OK from STEP611D: " + $step612CompletionOk)
Write-Host ("STEP612 files updated: " + $step612FilesUpdated)
Write-Host ("STEP612 warnings/errors: " + $step612Warnings + "/" + $step612Errors)
Write-Host ("Status files checked: " + @($fileChecks).Count)
Write-Host ("Status files with STEP612 section: " + @($fileChecks | Where-Object { $_.ok }).Count)
Write-Host ("All status files have STEP612 section: " + $allFilesHaveStep612)
Write-Host ("Status Verification OK: " + $statusVerificationOk)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
