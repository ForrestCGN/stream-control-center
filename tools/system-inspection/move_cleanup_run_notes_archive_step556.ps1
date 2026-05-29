param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$OutDir = "",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ProjectRoot)) {
  throw ("Projektpfad nicht gefunden: " + $ProjectRoot)
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path -Path $ProjectRoot -ChildPath "system-scan-output"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$targetArchiveDirRel = "project-state/archive/2026-05-29-step554-cleanup-run-notes"
$targetArchiveDirFull = Join-Path -Path $ProjectRoot -ChildPath ($targetArchiveDirRel.Replace("/", "\"))

$cleanupRunFiles = @(
  "project-state/STEP543_PROJECT_STATE_ARCHIVE_BATCH_PLAN.md",
  "project-state/STEP544_PROJECT_STATE_BATCH_A_RESCUE_DRYRUN.md",
  "project-state/STEP545_PROJECT_STATE_BATCH_A_QUARANTINE_MOVE.md",
  "project-state/STEP546_CHANNELPOINTS_COMMANDS_STATE_CONSOLIDATION_PLAN.md",
  "project-state/STEP547_CHANNELPOINTS_STATE_CONSOLIDATION_DRAFT.md",
  "project-state/STEP548_COMMANDS_STATE_CONSOLIDATION_DRAFT.md",
  "project-state/STEP549_FEATURE_STATE_ARCHIVE_PLAN.md",
  "project-state/STEP550_FEATURE_STATE_ARCHIVE_DRYRUN.md",
  "project-state/STEP551_FEATURE_STATE_ARCHIVE_APPLY.md",
  "project-state/STEP552_PROJECT_STATE_ROOT_VERIFICATION_SCAN.md",
  "project-state/NEXT_STEPS_STEP543_APPEND.md",
  "project-state/NEXT_STEPS_STEP546_APPEND.md",
  "project-state/NEXT_STEPS_STEP547_APPEND.md",
  "project-state/NEXT_STEPS_STEP548_APPEND.md",
  "project-state/NEXT_STEPS_STEP549_APPEND.md"
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

foreach ($p in $cleanupRunFiles) {
  if ($protected -contains $p) {
    $errors += ("Protected file accidentally included: " + $p)
  }
  if ($p.StartsWith("project-state/archive/")) {
    $errors += ("Archive file accidentally included: " + $p)
  }
  if ($p -like "project-state/STEP47*.md" -or $p -like "project-state/STEP48*.md" -or $p -like "project-state/STEP49*.md") {
    if ($p -notlike "project-state/STEP543*" -and $p -notlike "project-state/STEP544*" -and $p -notlike "project-state/STEP545*" -and $p -notlike "project-state/STEP546*" -and $p -notlike "project-state/STEP547*" -and $p -notlike "project-state/STEP548*" -and $p -notlike "project-state/STEP549*") {
      $errors += ("Older STEP file accidentally included: " + $p)
    }
  }
}

foreach ($p in $protected) {
  $full = Convert-ToLocalPath -RelPath $p
  if (-not (Test-Path -LiteralPath $full)) {
    $warnings += ("Protected/reference file not found: " + $p)
  }
}

$plan = @()
foreach ($p in $cleanupRunFiles) {
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

$mode = "DRY_RUN"
if ($Apply) {
  $mode = "APPLY"
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$reportTxt = Join-Path -Path $OutDir -ChildPath "step556_cleanup_run_notes_archive_apply_report.txt"
$reportJson = Join-Path -Path $OutDir -ChildPath "step556_cleanup_run_notes_archive_apply_report.json"
$manifestMd = Join-Path -Path $OutDir -ChildPath "step556_cleanup_run_notes_archive_manifest.md"

$applied = @()

if ($Apply) {
  if (@($errors).Count -gt 0) {
    throw ("Apply refused. Errors: " + ($errors -join " | "))
  }

  New-Item -ItemType Directory -Force -Path $targetArchiveDirFull | Out-Null

  foreach ($entry in $plan) {
    $sourceFull = Convert-ToLocalPath -RelPath $entry.source
    $targetFull = Convert-ToLocalPath -RelPath $entry.target
    Move-Item -LiteralPath $sourceFull -Destination $targetFull

    $applied += [pscustomobject]@{
      source = $entry.source
      target = $entry.target
      moved = $true
      bytes = $entry.bytes
      modified = $entry.modified
    }
  }
}

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    targetArchiveDir = $targetArchiveDirRel
    mode = $mode
    plannedFiles = @($cleanupRunFiles).Count
    sourceMissing = @($missing).Count
    targetConflicts = @($targetConflicts).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
    appliedMoves = @($applied).Count
  }
  plan = $plan
  warningsList = $warnings
  errorsList = $errors
  applied = $applied
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportJson -Encoding UTF8

$lines = @()
$lines += "STEP556 Cleanup Run Notes Archive Apply Report"
$lines += "Generated: " + $timestamp
$lines += "ProjectRoot: " + $ProjectRoot
$lines += "Mode: " + $mode
$lines += "TargetArchiveDir: " + $targetArchiveDirRel
$lines += "Planned files: " + @($cleanupRunFiles).Count
$lines += "Source missing: " + @($missing).Count
$lines += "Target conflicts: " + @($targetConflicts).Count
$lines += "Warnings: " + @($warnings).Count
$lines += "Errors: " + @($errors).Count
$lines += "Applied moves: " + @($applied).Count
$lines += ""
if (@($errors).Count -gt 0) {
  $lines += "Errors:"
  foreach ($e in $errors) {
    $lines += "ERROR | " + $e
  }
  $lines += ""
}
if (@($warnings).Count -gt 0) {
  $lines += "Warnings:"
  foreach ($w in $warnings) {
    $lines += "WARN | " + $w
  }
  $lines += ""
}
$lines += "Plan:"
foreach ($entry in $plan) {
  if ($Apply) {
    $didMove = @($applied | Where-Object { $_.source -eq $entry.source }).Count -gt 0
    if ($didMove) {
      $lines += "MOVED | " + $entry.source + " -> " + $entry.target + " | bytes=" + $entry.bytes
    } else {
      $lines += "NOT_MOVED | " + $entry.source + " -> " + $entry.target
    }
  } else {
    $lines += "WOULD_MOVE | " + $entry.source + " -> " + $entry.target + " | bytes=" + $entry.bytes + " | sourceExists=" + $entry.sourceExists + " | targetExists=" + $entry.targetExists
  }
}
$lines | Out-File -FilePath $reportTxt -Encoding UTF8

$manifest = @()
$manifest += "# STEP556 Cleanup Run Notes Archive Manifest"
$manifest += ""
$manifest += "Generated: " + $timestamp
$manifest += ""
$manifest += "Mode: " + $mode
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
$manifest += "- project-state core files"
$manifest += "- project-state/CHANNELPOINTS_CURRENT_STATE.md"
$manifest += "- project-state/COMMANDS_CURRENT_STATE.md"
$manifest += "- docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
$manifest += "- project-state/archive/*"
$manifest += "- STEP476-STEP497 older root files"
$manifest | Out-File -FilePath $manifestMd -Encoding UTF8

Write-Host ""
Write-Host "STEP556 Cleanup Run Notes Archive fertig."
Write-Host ("Mode: " + $mode)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Applied moves: " + @($applied).Count)
Write-Host ("Report: " + $reportTxt)
Write-Host ("JSON: " + $reportJson)
Write-Host ("Manifest: " + $manifestMd)

if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Fuer echtes Verschieben erneut mit -Apply ausfuehren."
}
