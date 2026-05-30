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

$targetArchiveDirRel = "project-state/archive/2026-05-30-step568-shoutout-state"

$shoutoutFiles = @(
  "project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md",
  "project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md",
  "project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md",
  "project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md"
)

$protected = @(
  "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md",
  "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md",
  "docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md",
  "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md",
  "project-state/CHANGELOG.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md"
)

function Convert-ToLocalPath {
  param([string]$RelPath)
  return Join-Path -Path $ProjectRoot -ChildPath ($RelPath.Replace("/", "\"))
}

function Get-TargetRel {
  param([string]$RelPath)
  return $targetArchiveDirRel + "/" + [System.IO.Path]::GetFileName($RelPath)
}

function New-MoveItemInfo {
  param([string]$RelPath)

  $sourceFull = Convert-ToLocalPath -RelPath $RelPath
  $targetRel = Get-TargetRel -RelPath $RelPath
  $targetFull = Convert-ToLocalPath -RelPath $targetRel

  $sourceExists = Test-Path -LiteralPath $sourceFull
  $targetExists = Test-Path -LiteralPath $targetFull

  $bytes = 0
  $modified = ""
  if ($sourceExists) {
    $item = Get-Item -LiteralPath $sourceFull
    $bytes = $item.Length
    $modified = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  }

  return [pscustomobject]@{
    source = $RelPath
    target = $targetRel
    sourceExists = $sourceExists
    targetExists = $targetExists
    bytes = $bytes
    modified = $modified
  }
}

$errors = @()
$warnings = @()

foreach ($p in $shoutoutFiles) {
  if ($protected -contains $p) {
    $errors += ("Protected file accidentally included: " + $p)
  }
  if ($p.StartsWith("project-state/archive/")) {
    $errors += ("Archive file accidentally included: " + $p)
  }
}

foreach ($p in $protected) {
  $full = Convert-ToLocalPath -RelPath $p
  if (-not (Test-Path -LiteralPath $full)) {
    $warnings += ("Protected/reference file not found: " + $p)
  }
}

$plan = @()
foreach ($p in $shoutoutFiles) {
  $plan += New-MoveItemInfo -RelPath $p
}

$missing = @($plan | Where-Object { $_.sourceExists -ne $true })
$targetConflicts = @($plan | Where-Object { $_.targetExists -eq $true })

foreach ($m in $missing) {
  $errors += ("Missing source: " + $m.source)
}
foreach ($c in $targetConflicts) {
  $errors += ("Target already exists: " + $c.target)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$reportTxt = Join-Path -Path $OutDir -ChildPath "step570_shoutout_archive_dryrun.txt"
$reportJson = Join-Path -Path $OutDir -ChildPath "step570_shoutout_archive_dryrun.json"
$summaryTxt = Join-Path -Path $OutDir -ChildPath "step570_shoutout_archive_dryrun_summary.txt"
$manifestMd = Join-Path -Path $OutDir -ChildPath "step570_shoutout_archive_manifest.md"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    targetArchiveDir = $targetArchiveDirRel
    mode = "DRY_RUN_ONLY"
    plannedFiles = @($shoutoutFiles).Count
    sourceMissing = @($missing).Count
    targetConflicts = @($targetConflicts).Count
    protectedFilesChecked = @($protected).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  plan = $plan
  protected = $protected
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportJson -Encoding UTF8

$lines = @()
$lines += "STEP570 Shoutout Archive Dry-Run"
$lines += "Generated: " + $timestamp
$lines += "ProjectRoot: " + $ProjectRoot
$lines += "Mode: DRY_RUN_ONLY"
$lines += "TargetArchiveDir: " + $targetArchiveDirRel
$lines += "Planned files: " + @($shoutoutFiles).Count
$lines += "Source missing: " + @($missing).Count
$lines += "Target conflicts: " + @($targetConflicts).Count
$lines += "Protected files checked: " + @($protected).Count
$lines += "Warnings: " + @($warnings).Count
$lines += "Errors: " + @($errors).Count
$lines += ""
if (@($errors).Count -gt 0) {
  $lines += "Errors:"
  foreach ($e in $errors) { $lines += "ERROR | " + $e }
  $lines += ""
}
if (@($warnings).Count -gt 0) {
  $lines += "Warnings:"
  foreach ($w in $warnings) { $lines += "WARN | " + $w }
  $lines += ""
}
$lines += "Planned moves:"
foreach ($entry in $plan) {
  $lines += "WOULD_MOVE | " + $entry.source + " -> " + $entry.target + " | bytes=" + $entry.bytes + " | sourceExists=" + $entry.sourceExists + " | targetExists=" + $entry.targetExists
}
$lines += ""
$lines += "Protected/reference files not included:"
foreach ($p in $protected) {
  $lines += "PROTECTED | " + $p
}
$lines | Out-File -FilePath $reportTxt -Encoding UTF8

$summary = @()
$summary += "STEP570 Shoutout Archive Dry-Run Summary"
$summary += "Generated: " + $timestamp
$summary += "Mode: DRY_RUN_ONLY"
$summary += "TargetArchiveDir: " + $targetArchiveDirRel
$summary += "Planned files: " + @($shoutoutFiles).Count
$summary += "Source missing: " + @($missing).Count
$summary += "Target conflicts: " + @($targetConflicts).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Expected next step if clean:"
$summary += "STEP571 - Shoutout Archive Apply"
$summary | Out-File -FilePath $summaryTxt -Encoding UTF8

$manifest = @()
$manifest += "# STEP570 Shoutout Archive Manifest"
$manifest += ""
$manifest += "Generated: " + $timestamp
$manifest += ""
$manifest += "Mode: DRY_RUN_ONLY"
$manifest += ""
$manifest += "Target archive directory:"
$manifest += ""
$manifest += $targetArchiveDirRel
$manifest += ""
$manifest += "Planned files:"
foreach ($entry in $plan) {
  $manifest += "- " + $entry.source + " -> " + $entry.target
}
$manifest += ""
$manifest += "Protected/reference files not included:"
foreach ($p in $protected) {
  $manifest += "- " + $p
}
$manifest += ""
$manifest += "Safety exclusions:"
$manifest += "- docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md"
$manifest += "- docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md"
$manifest += "- docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md"
$manifest += "- project-state core files"
$manifest += "- project-state/archive/*"
$manifest += "- productive backend/htdocs/config/data files"
$manifest | Out-File -FilePath $manifestMd -Encoding UTF8

Write-Host ""
Write-Host "STEP570 Shoutout Archive Dry-Run fertig."
Write-Host "Mode: DRY_RUN_ONLY"
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Report: " + $reportTxt)
Write-Host ("Summary: " + $summaryTxt)
Write-Host ("JSON: " + $reportJson)
Write-Host ("Manifest: " + $manifestMd)
