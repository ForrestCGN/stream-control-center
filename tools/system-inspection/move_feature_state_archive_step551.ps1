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

$targetArchiveDirRel = "project-state/archive/2026-05-29-step549-feature-state-notes"
$targetArchiveDirFull = Join-Path -Path $ProjectRoot -ChildPath ($targetArchiveDirRel.Replace("/", "\"))

$featureStateFiles = @(
  "project-state/CHANNELPOINTS_PRESERVE_MODAL_DRAFT_STATE_v0.7.1.md",
  "project-state/CHANNELPOINTS_EVENTBUS_DOCS_FINAL_POLISH_v0.7.5.md",
  "project-state/CHANNELPOINTS_FRIENDLY_MEDIA_ACTION_EDITOR_v0.6.1.md",
  "project-state/CHANNELPOINTS_MEDIA_EXECUTION_BRIDGE_v0.6.0.md",
  "project-state/CHANNELPOINTS_REDEMPTION_EXECUTION_FLOW_v0.7.2.md",
  "project-state/CHANNELPOINTS_SAFE_MODAL_EDITOR_v0.7.0.md",
  "project-state/CHANNELPOINTS_TEXT_REWARD_REDEMPTION_POLISH_v0.7.3.md",
  "project-state/CHANNELPOINTS_TWITCH_AUTH_SCOPE_CHECK_v0.8.0.md",
  "project-state/CHANNELPOINTS_TWITCH_SYNC_READINESS_v0.7.4.md",
  "project-state/COMMANDS_PRESERVE_MODAL_DRAFT_STATE_v0.1.9.md",
  "project-state/COMMANDS_ACTION_TYPE_DRIVEN_EDITOR_v0.1.7.md",
  "project-state/COMMANDS_BACKEND_SAFE_EDIT_PARAM_FIX_v0.1.5.md",
  "project-state/COMMANDS_EXACT_SAVED_COMMAND_EDITOR_v0.1.5.md",
  "project-state/COMMANDS_MEDIA_PLAYBACK_PAYLOAD_BRIDGE_v0.1.3.md",
  "project-state/COMMANDS_SAFE_MODAL_EDITOR_v0.1.4.md",
  "project-state/COMMANDS_SEPARATED_ACTION_CHAT_MEDIA_PICKER_v0.1.8.md",
  "project-state/COMMANDS_STATUS_NO_SCHEMA_TOUCH_v0.1.2.md",
  "project-state/COMMANDS_UNIFIED_ACTION_DROPDOWN_TEXT_OUTPUT_v0.1.6.md"
)

$protected = @(
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
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

foreach ($p in $featureStateFiles) {
  if ($protected -contains $p) {
    $errors += ("Protected file accidentally included: " + $p)
  }
  if ($p.StartsWith("project-state/archive/")) {
    $errors += ("Archive file accidentally included: " + $p)
  }
  if ($p -like "project-state/STEP*") {
    $errors += ("STEP file accidentally included: " + $p)
  }
}

foreach ($p in $protected) {
  $full = Convert-ToLocalPath -RelPath $p
  if (-not (Test-Path -LiteralPath $full)) {
    $errors += ("Missing protected file: " + $p)
  }
}

$plan = @()
foreach ($p in $featureStateFiles) {
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
$reportTxt = Join-Path -Path $OutDir -ChildPath "step551_feature_state_archive_apply_report.txt"
$reportJson = Join-Path -Path $OutDir -ChildPath "step551_feature_state_archive_apply_report.json"
$manifestMd = Join-Path -Path $OutDir -ChildPath "step551_feature_state_archive_manifest.md"

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
    plannedFiles = @($featureStateFiles).Count
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
$lines += "STEP551 Feature State Archive Apply Report"
$lines += "Generated: " + $timestamp
$lines += "ProjectRoot: " + $ProjectRoot
$lines += "Mode: " + $mode
$lines += "TargetArchiveDir: " + $targetArchiveDirRel
$lines += "Planned files: " + @($featureStateFiles).Count
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
$manifest += "# STEP551 Feature State Archive Manifest"
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
$manifest += "- project-state/CHANNELPOINTS_CURRENT_STATE.md"
$manifest += "- project-state/COMMANDS_CURRENT_STATE.md"
$manifest += "- project-state/archive/*"
$manifest += "- project-state core files"
$manifest += "- project-state/STEP*"
$manifest | Out-File -FilePath $manifestMd -Encoding UTF8

Write-Host ""
Write-Host "STEP551 Feature State Archive fertig."
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
