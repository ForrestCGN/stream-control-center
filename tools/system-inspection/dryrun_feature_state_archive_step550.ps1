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

$targetArchiveDir = "project-state/archive/2026-05-29-step549-feature-state-notes"

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

function New-ItemInfo {
  param([string]$RelPath)

  $sourceFull = Convert-ToLocalPath -RelPath $RelPath
  $targetRel = $targetArchiveDir + "/" + [System.IO.Path]::GetFileName($RelPath)
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

$plan = @()
foreach ($p in $featureStateFiles) {
  $plan += New-ItemInfo -RelPath $p
}

$protectedItems = @()
foreach ($p in $protected) {
  $protectedItems += New-ItemInfo -RelPath $p
}

$errors = @()

$currentChannelpoints = Convert-ToLocalPath -RelPath "project-state/CHANNELPOINTS_CURRENT_STATE.md"
$currentCommands = Convert-ToLocalPath -RelPath "project-state/COMMANDS_CURRENT_STATE.md"

if (-not (Test-Path -LiteralPath $currentChannelpoints)) {
  $errors += "Missing protected current-state file: project-state/CHANNELPOINTS_CURRENT_STATE.md"
}
if (-not (Test-Path -LiteralPath $currentCommands)) {
  $errors += "Missing protected current-state file: project-state/COMMANDS_CURRENT_STATE.md"
}

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

$missing = @($plan | Where-Object { $_.sourceExists -ne $true })
$targetConflicts = @($plan | Where-Object { $_.targetExists -eq $true })

foreach ($m in $missing) {
  $errors += ("Missing source: " + $m.source)
}
foreach ($c in $targetConflicts) {
  $errors += ("Target already exists: " + $c.target)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step550_feature_state_archive_dryrun_summary.txt"
$dryrunPath = Join-Path -Path $OutDir -ChildPath "step550_feature_state_archive_dryrun.txt"
$manifestPath = Join-Path -Path $OutDir -ChildPath "step550_feature_state_archive_manifest.md"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step550_feature_state_archive_dryrun.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    targetArchiveDir = $targetArchiveDir
    mode = "DRY_RUN_ONLY"
    plannedFiles = @($featureStateFiles).Count
    sourceMissing = @($missing).Count
    targetConflicts = @($targetConflicts).Count
    protectedFilesChecked = @($protectedItems).Count
    errors = @($errors).Count
  }
  plan = $plan
  protected = $protectedItems
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP550 Feature State Archive Dry-Run Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "TargetArchiveDir: " + $targetArchiveDir
$summary += "Mode: DRY_RUN_ONLY"
$summary += "Planned files: " + @($featureStateFiles).Count
$summary += "Source missing: " + @($missing).Count
$summary += "Target conflicts: " + @($targetConflicts).Count
$summary += "Protected files checked: " + @($protectedItems).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
if (@($errors).Count -gt 0) {
  $summary += "Errors:"
  foreach ($e in $errors) {
    $summary += "ERROR | " + $e
  }
}
$summary += ""
$summary += "Important:"
$summary += "- Dry-run only."
$summary += "- Nothing was moved."
$summary += "- CHANNELPOINTS_CURRENT_STATE.md and COMMANDS_CURRENT_STATE.md must stay active."
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

$dry = @()
$dry += "STEP550 Feature State Archive Dry-Run"
$dry += ""
foreach ($entry in $plan) {
  if ($entry.sourceExists -eq $true) {
    $dry += "WOULD_MOVE | " + $entry.source + " -> " + $entry.target + " | bytes=" + $entry.bytes + " | targetExists=" + $entry.targetExists
  } else {
    $dry += "MISSING | " + $entry.source + " -> " + $entry.target
  }
}
$dry += ""
$dry += "Protected files - must NOT move:"
foreach ($entry in $protectedItems) {
  $dry += "PROTECTED | " + $entry.source + " | exists=" + $entry.sourceExists + " | bytes=" + $entry.bytes
}
$dry | Out-File -FilePath $dryrunPath -Encoding UTF8

$manifest = @()
$manifest += "# STEP550 Feature State Archive Manifest"
$manifest += ""
$manifest += "Generated: " + $timestamp
$manifest += ""
$manifest += "Mode: DRY_RUN_ONLY"
$manifest += ""
$manifest += "Target archive directory:"
$manifest += ""
$manifest += $targetArchiveDir
$manifest += ""
$manifest += "Planned files:"
foreach ($entry in $plan) {
  $manifest += "- " + $entry.source + " -> " + $entry.target
}
$manifest += ""
$manifest += "Protected files not included:"
foreach ($entry in $protectedItems) {
  $manifest += "- " + $entry.source
}
$manifest += ""
$manifest += "Safety exclusions:"
$manifest += "- project-state/CHANNELPOINTS_CURRENT_STATE.md"
$manifest += "- project-state/COMMANDS_CURRENT_STATE.md"
$manifest += "- project-state/archive/*"
$manifest += "- project-state core files"
$manifest += "- project-state/STEP*"
$manifest | Out-File -FilePath $manifestPath -Encoding UTF8

Write-Host ""
Write-Host "STEP550 Feature State Archive Dry-Run fertig."
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("DryRun: " + $dryrunPath)
Write-Host ("Manifest: " + $manifestPath)
Write-Host ("JSON: " + $jsonPath)
