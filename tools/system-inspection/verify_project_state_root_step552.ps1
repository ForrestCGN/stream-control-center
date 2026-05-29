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

$projectStateDir = Join-Path -Path $ProjectRoot -ChildPath "project-state"
$archiveDirRel = "project-state/archive/2026-05-29-step549-feature-state-notes"
$archiveDir = Join-Path -Path $ProjectRoot -ChildPath ($archiveDirRel.Replace("/", "\"))

$coreActive = @(
  "project-state/CHANGELOG.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md"
)

$expectedArchived = @(
  "CHANNELPOINTS_PRESERVE_MODAL_DRAFT_STATE_v0.7.1.md",
  "CHANNELPOINTS_EVENTBUS_DOCS_FINAL_POLISH_v0.7.5.md",
  "CHANNELPOINTS_FRIENDLY_MEDIA_ACTION_EDITOR_v0.6.1.md",
  "CHANNELPOINTS_MEDIA_EXECUTION_BRIDGE_v0.6.0.md",
  "CHANNELPOINTS_REDEMPTION_EXECUTION_FLOW_v0.7.2.md",
  "CHANNELPOINTS_SAFE_MODAL_EDITOR_v0.7.0.md",
  "CHANNELPOINTS_TEXT_REWARD_REDEMPTION_POLISH_v0.7.3.md",
  "CHANNELPOINTS_TWITCH_AUTH_SCOPE_CHECK_v0.8.0.md",
  "CHANNELPOINTS_TWITCH_SYNC_READINESS_v0.7.4.md",
  "COMMANDS_PRESERVE_MODAL_DRAFT_STATE_v0.1.9.md",
  "COMMANDS_ACTION_TYPE_DRIVEN_EDITOR_v0.1.7.md",
  "COMMANDS_BACKEND_SAFE_EDIT_PARAM_FIX_v0.1.5.md",
  "COMMANDS_EXACT_SAVED_COMMAND_EDITOR_v0.1.5.md",
  "COMMANDS_MEDIA_PLAYBACK_PAYLOAD_BRIDGE_v0.1.3.md",
  "COMMANDS_SAFE_MODAL_EDITOR_v0.1.4.md",
  "COMMANDS_SEPARATED_ACTION_CHAT_MEDIA_PICKER_v0.1.8.md",
  "COMMANDS_STATUS_NO_SCHEMA_TOUCH_v0.1.2.md",
  "COMMANDS_UNIFIED_ACTION_DROPDOWN_TEXT_OUTPUT_v0.1.6.md"
)

function To-Rel {
  param([string]$FullPath)
  $full = [System.IO.Path]::GetFullPath($FullPath)
  $rootFull = [System.IO.Path]::GetFullPath($ProjectRoot)
  return $full.Substring($rootFull.Length).TrimStart("\").Replace("\", "/")
}

function To-Full {
  param([string]$Rel)
  return Join-Path -Path $ProjectRoot -ChildPath ($Rel.Replace("/", "\"))
}

function Get-FileInfoObj {
  param([string]$Rel)
  $full = To-Full -Rel $Rel
  $exists = Test-Path -LiteralPath $full
  $bytes = 0
  $modified = ""
  if ($exists) {
    $item = Get-Item -LiteralPath $full
    $bytes = $item.Length
    $modified = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  }
  return [pscustomobject]@{
    path = $Rel
    exists = $exists
    bytes = $bytes
    modified = $modified
  }
}

$errors = @()
$warnings = @()

if (-not (Test-Path -LiteralPath $projectStateDir)) {
  throw ("project-state nicht gefunden: " + $projectStateDir)
}

$coreStatus = @()
foreach ($rel in $coreActive) {
  $info = Get-FileInfoObj -Rel $rel
  $coreStatus += $info
  if (-not $info.exists) {
    $errors += ("Missing active/core file: " + $rel)
  }
}

$rootMdFiles = @(Get-ChildItem -LiteralPath $projectStateDir -File -Filter "*.md" | Sort-Object Name)
$rootFileObjs = @()
foreach ($f in $rootMdFiles) {
  $rel = To-Rel -FullPath $f.FullName
  $rootFileObjs += [pscustomobject]@{
    path = $rel
    bytes = $f.Length
    modified = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  }
}

$featureStateLeftovers = @($rootFileObjs | Where-Object {
  $_.path -like "project-state/CHANNELPOINTS_*.md" -or $_.path -like "project-state/COMMANDS_*.md"
} | Where-Object {
  $_.path -ne "project-state/CHANNELPOINTS_CURRENT_STATE.md" -and $_.path -ne "project-state/COMMANDS_CURRENT_STATE.md"
})

foreach ($l in $featureStateLeftovers) {
  $errors += ("Feature-state leftover in project-state root: " + $l.path)
}

$stepRootFiles = @($rootFileObjs | Where-Object { $_.path -like "project-state/STEP*.md" })
$nextStepsAppends = @($rootFileObjs | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" })

foreach ($f in $stepRootFiles) {
  $warnings += ("STEP root file still active/review later: " + $f.path)
}
foreach ($f in $nextStepsAppends) {
  $warnings += ("NEXT_STEPS append still active/review later: " + $f.path)
}

$archiveStatus = @()
$archiveMissing = @()
$archivePresent = @()

foreach ($name in $expectedArchived) {
  $rel = $archiveDirRel + "/" + $name
  $info = Get-FileInfoObj -Rel $rel
  $archiveStatus += $info
  if ($info.exists) {
    $archivePresent += $rel
  } else {
    $archiveMissing += $rel
    $errors += ("Missing expected archived file: " + $rel)
  }
}

$archiveExtra = @()
if (Test-Path -LiteralPath $archiveDir) {
  $archiveFiles = @(Get-ChildItem -LiteralPath $archiveDir -File -Filter "*.md" | Sort-Object Name)
  foreach ($f in $archiveFiles) {
    if ($expectedArchived -notcontains $f.Name) {
      $archiveExtra += (To-Rel -FullPath $f.FullName)
      $warnings += ("Extra file in feature-state archive folder: " + (To-Rel -FullPath $f.FullName))
    }
  }
} else {
  $errors += ("Archive directory missing: " + $archiveDirRel)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step552_project_state_root_verification_summary.txt"
$rootListPath = Join-Path -Path $OutDir -ChildPath "step552_project_state_root_files.txt"
$archivePath = Join-Path -Path $OutDir -ChildPath "step552_feature_state_archive_verification.txt"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step552_project_state_root_verification.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    rootMdFiles = @($rootFileObjs).Count
    coreActiveChecked = @($coreStatus).Count
    featureStateLeftovers = @($featureStateLeftovers).Count
    expectedArchived = @($expectedArchived).Count
    archivePresent = @($archivePresent).Count
    archiveMissing = @($archiveMissing).Count
    archiveExtra = @($archiveExtra).Count
    stepRootFiles = @($stepRootFiles).Count
    nextStepsAppends = @($nextStepsAppends).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  rootFiles = $rootFileObjs
  coreActive = $coreStatus
  featureStateLeftovers = $featureStateLeftovers
  archiveStatus = $archiveStatus
  archiveExtra = $archiveExtra
  stepRootFiles = $stepRootFiles
  nextStepsAppends = $nextStepsAppends
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP552 Project-State Root Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Root md files: " + @($rootFileObjs).Count
$summary += "Core active checked: " + @($coreStatus).Count
$summary += "Feature-state leftovers in root: " + @($featureStateLeftovers).Count
$summary += "Expected archived files: " + @($expectedArchived).Count
$summary += "Archive present: " + @($archivePresent).Count
$summary += "Archive missing: " + @($archiveMissing).Count
$summary += "Archive extra: " + @($archiveExtra).Count
$summary += "STEP root files: " + @($stepRootFiles).Count
$summary += "NEXT_STEPS append files: " + @($nextStepsAppends).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
if (@($errors).Count -gt 0) {
  $summary += "Errors:"
  foreach ($e in $errors) {
    $summary += "ERROR | " + $e
  }
  $summary += ""
}
if (@($warnings).Count -gt 0) {
  $summary += "Warnings:"
  foreach ($w in $warnings) {
    $summary += "WARN | " + $w
  }
}
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

$rootLines = @()
$rootLines += "STEP552 Project-State Root Files"
$rootLines += ""
foreach ($f in $rootFileObjs) {
  $rootLines += $f.path + " | bytes=" + $f.bytes + " | modified=" + $f.modified
}
$rootLines | Out-File -FilePath $rootListPath -Encoding UTF8

$archiveLines = @()
$archiveLines += "STEP552 Feature-State Archive Verification"
$archiveLines += ""
$archiveLines += "Archive directory: " + $archiveDirRel
$archiveLines += ""
foreach ($info in $archiveStatus) {
  $archiveLines += "ARCHIVE_EXPECTED | " + $info.path + " | exists=" + $info.exists + " | bytes=" + $info.bytes
}
if (@($archiveExtra).Count -gt 0) {
  $archiveLines += ""
  $archiveLines += "Archive extra files:"
  foreach ($e in $archiveExtra) {
    $archiveLines += "ARCHIVE_EXTRA | " + $e
  }
}
$archiveLines += ""
$archiveLines += "Feature-state leftovers in root:"
if (@($featureStateLeftovers).Count -eq 0) {
  $archiveLines += "NONE"
} else {
  foreach ($l in $featureStateLeftovers) {
    $archiveLines += "LEFTOVER | " + $l.path
  }
}
$archiveLines | Out-File -FilePath $archivePath -Encoding UTF8

Write-Host ""
Write-Host "STEP552 Project-State Root Verification fertig."
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("RootFiles: " + $rootListPath)
Write-Host ("Archive: " + $archivePath)
Write-Host ("JSON: " + $jsonPath)
