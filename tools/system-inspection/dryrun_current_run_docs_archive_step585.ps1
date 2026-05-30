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

$targetArchiveDirRel = "project-state/archive/2026-05-30-step583-current-run-docs"

$currentRunFiles = @(
  "project-state/STEP553_REMAINING_PROJECT_STATE_ROOT_CLEANUP_PLAN.md",
  "project-state/STEP554_CLEANUP_RUN_NOTES_RESCUE_AND_DRYRUN_PLAN.md",
  "project-state/STEP555_CLEANUP_RUN_NOTES_ARCHIVE_DRYRUN.md",
  "project-state/STEP556_CLEANUP_RUN_NOTES_ARCHIVE_APPLY.md",
  "project-state/STEP557_POST_CLEANUP_PROJECT_STATE_VERIFICATION_SCAN.md",
  "project-state/STEP558_MODULE_META_RULES_CONSOLIDATION_PLAN.md",
  "project-state/STEP559_BATCH_B_CONTENT_RESCUE_DRAFT.md",
  "project-state/STEP560_BATCH_B_MODULE_META_RULES_ARCHIVE_DRYRUN.md",
  "project-state/STEP561_BATCH_B_MODULE_META_RULES_ARCHIVE_APPLY.md",
  "project-state/STEP562_POST_BATCH_B_VERIFICATION_SCAN.md",
  "project-state/STEP563_COMMUNICATION_BUS_STATE_CONSOLIDATION_PLAN.md",
  "project-state/STEP564_COMMUNICATION_BUS_CONTENT_RESCUE_DRAFT.md",
  "project-state/STEP565_COMMUNICATION_BUS_ARCHIVE_DRYRUN.md",
  "project-state/STEP566_COMMUNICATION_BUS_ARCHIVE_APPLY.md",
  "project-state/STEP567_POST_COMMUNICATION_BUS_VERIFICATION_SCAN.md",
  "project-state/STEP568_SHOUTOUT_STATE_CONSOLIDATION_PLAN.md",
  "project-state/STEP569_SHOUTOUT_CONTENT_RESCUE_DRAFT.md",
  "project-state/STEP570_SHOUTOUT_ARCHIVE_DRYRUN.md",
  "project-state/STEP571_SHOUTOUT_ARCHIVE_APPLY.md",
  "project-state/STEP572_POST_SHOUTOUT_VERIFICATION_SCAN.md",
  "project-state/STEP573_CHANNELPOINTS_BUILD_STATE_CONSOLIDATION_PLAN.md",
  "project-state/STEP574_CHANNELPOINTS_BUILD_CONTENT_RESCUE_DRAFT.md",
  "project-state/STEP575_CHANNELPOINTS_BUILD_ARCHIVE_DRYRUN.md",
  "project-state/STEP576_CHANNELPOINTS_BUILD_ARCHIVE_APPLY.md",
  "project-state/STEP577_POST_CHANNELPOINTS_BUILD_VERIFICATION_SCAN.md",
  "project-state/STEP578_DASHBOARD_COMMANDS_STATE_CONSOLIDATION_PLAN.md",
  "project-state/STEP579_DASHBOARD_COMMANDS_CONTENT_RESCUE_DRAFT.md",
  "project-state/STEP580_DASHBOARD_COMMANDS_ARCHIVE_DRYRUN.md",
  "project-state/STEP581_DASHBOARD_COMMANDS_ARCHIVE_APPLY.md",
  "project-state/STEP582_POST_DASHBOARD_COMMANDS_VERIFICATION_SCAN.md",
  "project-state/STEP583_CURRENT_RUN_DOCS_CLEANUP_PLAN.md",
  "project-state/STEP584_CURRENT_RUN_DOCS_RESCUE_HISTORY_APPEND.md",
  "project-state/NEXT_STEPS_STEP553_APPEND.md",
  "project-state/NEXT_STEPS_STEP554_APPEND.md",
  "project-state/NEXT_STEPS_STEP558_APPEND.md",
  "project-state/NEXT_STEPS_STEP559_APPEND.md",
  "project-state/NEXT_STEPS_STEP563_APPEND.md",
  "project-state/NEXT_STEPS_STEP564_APPEND.md",
  "project-state/NEXT_STEPS_STEP568_APPEND.md",
  "project-state/NEXT_STEPS_STEP569_APPEND.md",
  "project-state/NEXT_STEPS_STEP573_APPEND.md",
  "project-state/NEXT_STEPS_STEP574_APPEND.md",
  "project-state/NEXT_STEPS_STEP578_APPEND.md",
  "project-state/NEXT_STEPS_STEP579_APPEND.md",
  "project-state/NEXT_STEPS_STEP583_APPEND.md"
)

$protected = @(
  "project-state/CHANGELOG.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md",
  "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md",
  "docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md",
  "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md",
  "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md",
  "docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md",
  "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
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

foreach ($p in $currentRunFiles) {
  if ($protected -contains $p) {
    $errors += ("Protected file accidentally included: " + $p)
  }
  if ($p.StartsWith("project-state/archive/")) {
    $errors += ("Archive file accidentally included: " + $p)
  }
  if (-not ($p.StartsWith("project-state/STEP") -or $p.StartsWith("project-state/NEXT_STEPS_STEP"))) {
    $errors += ("Unexpected current-run path pattern: " + $p)
  }
}

foreach ($p in $protected) {
  $full = Convert-ToLocalPath -RelPath $p
  if (-not (Test-Path -LiteralPath $full)) {
    $warnings += ("Protected/reference file not found: " + $p)
  }
}

$duplicates = @($currentRunFiles | Group-Object | Where-Object { $_.Count -gt 1 })
foreach ($d in $duplicates) {
  $errors += ("Duplicate planned file: " + $d.Name)
}

$plan = @()
foreach ($p in $currentRunFiles) {
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
$reportTxt = Join-Path -Path $OutDir -ChildPath "step585_current_run_docs_archive_dryrun.txt"
$reportJson = Join-Path -Path $OutDir -ChildPath "step585_current_run_docs_archive_dryrun.json"
$summaryTxt = Join-Path -Path $OutDir -ChildPath "step585_current_run_docs_archive_dryrun_summary.txt"
$manifestMd = Join-Path -Path $OutDir -ChildPath "step585_current_run_docs_archive_manifest.md"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    targetArchiveDir = $targetArchiveDirRel
    mode = "DRY_RUN_ONLY"
    plannedFiles = @($currentRunFiles).Count
    sourceMissing = @($missing).Count
    targetConflicts = @($targetConflicts).Count
    duplicatePlannedFiles = @($duplicates).Count
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
$lines += "STEP585 Current Run Docs Archive Dry-Run"
$lines += "Generated: " + $timestamp
$lines += "ProjectRoot: " + $ProjectRoot
$lines += "Mode: DRY_RUN_ONLY"
$lines += "TargetArchiveDir: " + $targetArchiveDirRel
$lines += "Planned files: " + @($currentRunFiles).Count
$lines += "Source missing: " + @($missing).Count
$lines += "Target conflicts: " + @($targetConflicts).Count
$lines += "Duplicate planned files: " + @($duplicates).Count
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
$summary += "STEP585 Current Run Docs Archive Dry-Run Summary"
$summary += "Generated: " + $timestamp
$summary += "Mode: DRY_RUN_ONLY"
$summary += "TargetArchiveDir: " + $targetArchiveDirRel
$summary += "Planned files: " + @($currentRunFiles).Count
$summary += "Source missing: " + @($missing).Count
$summary += "Target conflicts: " + @($targetConflicts).Count
$summary += "Duplicate planned files: " + @($duplicates).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Expected next step if clean:"
$summary += "STEP586 - Current Run Docs Archive Apply"
$summary | Out-File -FilePath $summaryTxt -Encoding UTF8

$manifest = @()
$manifest += "# STEP585 Current Run Docs Archive Manifest"
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
$manifest += "- project-state core/current files"
$manifest += "- docs/system-inspection/*_CONSOLIDATION.md"
$manifest += "- docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
$manifest += "- project-state/archive/*"
$manifest += "- productive backend/htdocs/config/data files"
$manifest | Out-File -FilePath $manifestMd -Encoding UTF8

Write-Host ""
Write-Host "STEP585 Current Run Docs Archive Dry-Run fertig."
Write-Host "Mode: DRY_RUN_ONLY"
Write-Host ("Planned files: " + @($currentRunFiles).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Report: " + $reportTxt)
Write-Host ("Summary: " + $summaryTxt)
Write-Host ("JSON: " + $reportJson)
Write-Host ("Manifest: " + $manifestMd)
