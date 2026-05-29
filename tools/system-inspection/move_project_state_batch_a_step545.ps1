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

$targetArchiveDirRel = "project-state/archive/2026-05-29-step544-project-state-batch-a"
$targetArchiveDirFull = Join-Path -Path $ProjectRoot -ChildPath ($targetArchiveDirRel.Replace("/", "\"))

$batchA = @(
  "project-state/NEXT_STEPS_STEP539_APPEND.md",
  "project-state/NEXT_STEPS_STEP541_APPEND.md",
  "project-state/STEP528_SYSTEM_SCAN_DOCUMENTATION_CLEANUP_MAP.md",
  "project-state/STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1.md",
  "project-state/STEP531_DOCS_TODO_AND_CLEANUP_SCAN.md",
  "project-state/STEP532_TODO_RESCUE_AND_DOC_CLEANUP_TRIAGE.md",
  "project-state/STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1.md",
  "project-state/STEP534_CURRENT_STEP_DOCS_CONSOLIDATION_BATCH2.md",
  "project-state/STEP535_TECH_STEP_DOCS_CLEANUP_SCAN.md",
  "project-state/STEP536_TECH_STEP_DOCS_TRIAGE_AND_BATCH_PLAN.md",
  "project-state/STEP536A_ALERT_TECH_DOCS_CONSOLIDATION.md",
  "project-state/STEP536B_SOUND_MEDIA_TECH_DOCS_CONSOLIDATION.md",
  "project-state/STEP536C_VIP_TECH_DOCS_CONSOLIDATION.md",
  "project-state/STEP536D_README_CLIP_MISC_TECH_DOCS_CONSOLIDATION.md",
  "project-state/STEP537_POST_CLEANUP_DOCS_VERIFICATION_SCAN.md",
  "project-state/STEP538_COMMUNICATION_AUDIT_CONSOLIDATION.md",
  "project-state/STEP539_TECH_STEP_DOCS_CLEANUP_COMPLETION.md",
  "project-state/STEP540_TODO_MARKER_TRIAGE_SCAN.md",
  "project-state/STEP541_TODO_MARKER_TRIAGE_FINDINGS.md",
  "project-state/STEP542_PROJECT_STATE_TRIAGE_SCAN.md"
)

$protected = @(
  "project-state/CHANGELOG.md",
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

foreach ($p in $batchA) {
  if ($protected -contains $p) {
    $errors += ("Protected file accidentally included in batch: " + $p)
  }
  if ($p.StartsWith("project-state/archive/")) {
    $errors += ("Archive file accidentally included in batch: " + $p)
  }
  if ($p -like "project-state/STEP47*" -or $p -like "project-state/STEP48*" -or $p -like "project-state/STEP49*") {
    $errors += ("Older STEP476-STEP497 family accidentally included in batch: " + $p)
  }
  if ($p -like "project-state/CHANNELPOINTS_*" -or $p -like "project-state/COMMANDS_*") {
    $errors += ("Manual review feature state accidentally included in batch: " + $p)
  }
}

$plan = @()
foreach ($p in $batchA) {
  $plan += New-MoveItemInfo -RelPath $p
}

$missing = @($plan | Where-Object { $_.sourceExists -ne $true })
$targetConflicts = @($plan | Where-Object { $_.targetExists -eq $true })

if (@($missing).Count -gt 0) {
  foreach ($m in $missing) {
    $errors += ("Missing source: " + $m.source)
  }
}

if (@($targetConflicts).Count -gt 0) {
  foreach ($c in $targetConflicts) {
    $errors += ("Target already exists: " + $c.target)
  }
}

$mode = "DRY_RUN"
if ($Apply) {
  $mode = "APPLY"
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$reportTxt = Join-Path -Path $OutDir -ChildPath "step545_project_state_batch_a_move_report.txt"
$reportJson = Join-Path -Path $OutDir -ChildPath "step545_project_state_batch_a_move_report.json"
$manifestMd = Join-Path -Path $OutDir -ChildPath "step545_project_state_batch_a_archive_manifest.md"

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
    plannedFiles = @($batchA).Count
    sourceMissing = @($missing).Count
    targetConflicts = @($targetConflicts).Count
    errors = @($errors).Count
    appliedMoves = @($applied).Count
  }
  plan = $plan
  errorsList = $errors
  applied = $applied
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportJson -Encoding UTF8

$lines = @()
$lines += "STEP545 Project-State Batch A Move Report"
$lines += "Generated: " + $timestamp
$lines += "ProjectRoot: " + $ProjectRoot
$lines += "Mode: " + $mode
$lines += "TargetArchiveDir: " + $targetArchiveDirRel
$lines += "Planned files: " + @($batchA).Count
$lines += "Source missing: " + @($missing).Count
$lines += "Target conflicts: " + @($targetConflicts).Count
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
$manifest += "# STEP545 Project-State Batch A Archive Manifest"
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
$manifest += "Protected files not included:"
foreach ($p in $protected) {
  $manifest += "- " + $p
}
$manifest += ""
$manifest += "Safety exclusions:"
$manifest += "- project-state/archive/*"
$manifest += "- project-state/STEP476_* through STEP497_*"
$manifest += "- project-state/CHANNELPOINTS_*.md"
$manifest += "- project-state/COMMANDS_*.md"
$manifest += "- project-state core files"
$manifest | Out-File -FilePath $manifestMd -Encoding UTF8

Write-Host ""
Write-Host "STEP545 Project-State Batch A fertig."
Write-Host ("Mode: " + $mode)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Applied moves: " + @($applied).Count)
Write-Host ("Report: " + $reportTxt)
Write-Host ("JSON: " + $reportJson)
Write-Host ("Manifest: " + $manifestMd)

if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry-run only. Fuer echtes Verschieben erneut mit -Apply ausfuehren."
}
