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

$cleanupArchiveRel = "project-state/archive/2026-05-29-step554-cleanup-run-notes"
$cleanupArchiveFull = Join-Path -Path $ProjectRoot -ChildPath ($cleanupArchiveRel.Replace("/", "\"))

$featureArchiveRel = "project-state/archive/2026-05-29-step549-feature-state-notes"
$featureArchiveFull = Join-Path -Path $ProjectRoot -ChildPath ($featureArchiveRel.Replace("/", "\"))

$coreActive = @(
  "project-state/CHANGELOG.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md"
)

$currentRunDocsAllowed = @(
  "project-state/STEP553_REMAINING_PROJECT_STATE_ROOT_CLEANUP_PLAN.md",
  "project-state/STEP554_CLEANUP_RUN_NOTES_RESCUE_AND_DRYRUN_PLAN.md",
  "project-state/STEP555_CLEANUP_RUN_NOTES_ARCHIVE_DRYRUN.md",
  "project-state/STEP556_CLEANUP_RUN_NOTES_ARCHIVE_APPLY.md",
  "project-state/STEP557_POST_CLEANUP_PROJECT_STATE_VERIFICATION_SCAN.md"
)

$currentNextAppendsAllowed = @(
  "project-state/NEXT_STEPS_STEP553_APPEND.md",
  "project-state/NEXT_STEPS_STEP554_APPEND.md"
)

$cleanupExpected = @(
  "STEP543_PROJECT_STATE_ARCHIVE_BATCH_PLAN.md",
  "STEP544_PROJECT_STATE_BATCH_A_RESCUE_DRYRUN.md",
  "STEP545_PROJECT_STATE_BATCH_A_QUARANTINE_MOVE.md",
  "STEP546_CHANNELPOINTS_COMMANDS_STATE_CONSOLIDATION_PLAN.md",
  "STEP547_CHANNELPOINTS_STATE_CONSOLIDATION_DRAFT.md",
  "STEP548_COMMANDS_STATE_CONSOLIDATION_DRAFT.md",
  "STEP549_FEATURE_STATE_ARCHIVE_PLAN.md",
  "STEP550_FEATURE_STATE_ARCHIVE_DRYRUN.md",
  "STEP551_FEATURE_STATE_ARCHIVE_APPLY.md",
  "STEP552_PROJECT_STATE_ROOT_VERIFICATION_SCAN.md",
  "NEXT_STEPS_STEP543_APPEND.md",
  "NEXT_STEPS_STEP546_APPEND.md",
  "NEXT_STEPS_STEP547_APPEND.md",
  "NEXT_STEPS_STEP548_APPEND.md",
  "NEXT_STEPS_STEP549_APPEND.md"
)

$featureExpected = @(
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

function Get-Info {
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
  $info = Get-Info -Rel $rel
  $coreStatus += $info
  if (-not $info.exists) {
    $errors += ("Missing core/current file: " + $rel)
  }
}

$rootFiles = @(Get-ChildItem -LiteralPath $projectStateDir -File -Filter "*.md" | Sort-Object Name)
$rootFileObjs = @()
foreach ($f in $rootFiles) {
  $rootFileObjs += [pscustomobject]@{
    path = To-Rel -FullPath $f.FullName
    bytes = $f.Length
    modified = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  }
}

$cleanupLeftovers = @($rootFileObjs | Where-Object {
  (
    $_.path -like "project-state/STEP54*.md" -or
    $_.path -like "project-state/STEP55*.md" -or
    $_.path -like "project-state/NEXT_STEPS_STEP543_APPEND.md" -or
    $_.path -like "project-state/NEXT_STEPS_STEP546_APPEND.md" -or
    $_.path -like "project-state/NEXT_STEPS_STEP547_APPEND.md" -or
    $_.path -like "project-state/NEXT_STEPS_STEP548_APPEND.md" -or
    $_.path -like "project-state/NEXT_STEPS_STEP549_APPEND.md"
  ) -and
  ($currentRunDocsAllowed -notcontains $_.path) -and
  ($currentNextAppendsAllowed -notcontains $_.path)
})

foreach ($l in $cleanupLeftovers) {
  $errors += ("Cleanup batch leftover in project-state root: " + $l.path)
}

$featureLeftovers = @($rootFileObjs | Where-Object {
  $_.path -like "project-state/CHANNELPOINTS_*.md" -or $_.path -like "project-state/COMMANDS_*.md"
} | Where-Object {
  $_.path -ne "project-state/CHANNELPOINTS_CURRENT_STATE.md" -and $_.path -ne "project-state/COMMANDS_CURRENT_STATE.md"
})
foreach ($l in $featureLeftovers) {
  $errors += ("Feature-state leftover in project-state root: " + $l.path)
}

$cleanupArchiveStatus = @()
$cleanupMissing = @()
$cleanupPresent = @()
foreach ($name in $cleanupExpected) {
  $rel = $cleanupArchiveRel + "/" + $name
  $info = Get-Info -Rel $rel
  $cleanupArchiveStatus += $info
  if ($info.exists) {
    $cleanupPresent += $rel
  } else {
    $cleanupMissing += $rel
    $errors += ("Missing cleanup archive file: " + $rel)
  }
}

$cleanupExtra = @()
if (Test-Path -LiteralPath $cleanupArchiveFull) {
  $archiveFiles = @(Get-ChildItem -LiteralPath $cleanupArchiveFull -File -Filter "*.md" | Sort-Object Name)
  foreach ($f in $archiveFiles) {
    if ($cleanupExpected -notcontains $f.Name) {
      $cleanupExtra += (To-Rel -FullPath $f.FullName)
      $warnings += ("Extra file in cleanup archive folder: " + (To-Rel -FullPath $f.FullName))
    }
  }
} else {
  $errors += ("Cleanup archive directory missing: " + $cleanupArchiveRel)
}

$featureArchiveStatus = @()
$featureMissing = @()
$featurePresent = @()
foreach ($name in $featureExpected) {
  $rel = $featureArchiveRel + "/" + $name
  $info = Get-Info -Rel $rel
  $featureArchiveStatus += $info
  if ($info.exists) {
    $featurePresent += $rel
  } else {
    $featureMissing += $rel
    $errors += ("Missing feature archive file: " + $rel)
  }
}

$remainingStepFiles = @($rootFileObjs | Where-Object { $_.path -like "project-state/STEP*.md" })
$remainingNextAppends = @($rootFileObjs | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" })

$batchBModuleRules = @($remainingStepFiles | Where-Object { $_.path -match "STEP47[6-9]_|STEP480_|STEP481_|STEP482_" })
$batchCCommunication = @($remainingStepFiles | Where-Object { $_.path -match "STEP487_|STEP488_" })
$batchDShoutout = @($remainingStepFiles | Where-Object { $_.path -match "STEP483_|STEP484_SHOUTOUT_|STEP485_|STEP486_" })
$batchEChannelpointsBuild = @($remainingStepFiles | Where-Object { $_.path -match "STEP484_CHANNELPOINTS_|STEP489_|STEP490_|STEP491_|STEP492_|STEP493_|STEP494_" })
$batchFDashboardCommands = @($remainingStepFiles | Where-Object { $_.path -match "STEP495_|STEP496_|STEP497_" })
$currentRunDocs = @($remainingStepFiles | Where-Object { $currentRunDocsAllowed -contains $_.path })
$currentRunAppends = @($remainingNextAppends | Where-Object { $currentNextAppendsAllowed -contains $_.path })

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step557_post_cleanup_project_state_summary.txt"
$rootPath = Join-Path -Path $OutDir -ChildPath "step557_project_state_root_files.txt"
$archivesPath = Join-Path -Path $OutDir -ChildPath "step557_archive_verification.txt"
$bucketsPath = Join-Path -Path $OutDir -ChildPath "step557_remaining_project_state_buckets.txt"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step557_post_cleanup_project_state_verification.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    scannerVersion = "0.1.1"
    rootMdFiles = @($rootFileObjs).Count
    coreActiveChecked = @($coreStatus).Count
    cleanupLeftovers = @($cleanupLeftovers).Count
    featureStateLeftovers = @($featureLeftovers).Count
    cleanupArchiveExpected = @($cleanupExpected).Count
    cleanupArchivePresent = @($cleanupPresent).Count
    cleanupArchiveMissing = @($cleanupMissing).Count
    cleanupArchiveExtra = @($cleanupExtra).Count
    featureArchiveExpected = @($featureExpected).Count
    featureArchivePresent = @($featurePresent).Count
    featureArchiveMissing = @($featureMissing).Count
    remainingStepFiles = @($remainingStepFiles).Count
    remainingNextStepAppends = @($remainingNextAppends).Count
    batchBModuleRules = @($batchBModuleRules).Count
    batchCCommunication = @($batchCCommunication).Count
    batchDShoutout = @($batchDShoutout).Count
    batchEChannelpointsBuild = @($batchEChannelpointsBuild).Count
    batchFDashboardCommands = @($batchFDashboardCommands).Count
    currentRunDocs = @($currentRunDocs).Count
    currentRunAppends = @($currentRunAppends).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  coreActive = $coreStatus
  rootFiles = $rootFileObjs
  cleanupLeftovers = $cleanupLeftovers
  featureLeftovers = $featureLeftovers
  cleanupArchiveStatus = $cleanupArchiveStatus
  featureArchiveStatus = $featureArchiveStatus
  remainingStepFiles = $remainingStepFiles
  remainingNextStepAppends = $remainingNextAppends
  buckets = [pscustomobject]@{
    batchBModuleRules = $batchBModuleRules
    batchCCommunication = $batchCCommunication
    batchDShoutout = $batchDShoutout
    batchEChannelpointsBuild = $batchEChannelpointsBuild
    batchFDashboardCommands = $batchFDashboardCommands
    currentRunDocs = $currentRunDocs
    currentRunAppends = $currentRunAppends
  }
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP557 Post-Cleanup Project-State Verification Summary"
$summary += "ScannerVersion: 0.1.1"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Root md files: " + @($rootFileObjs).Count
$summary += "Core active checked: " + @($coreStatus).Count
$summary += "Cleanup leftovers in root: " + @($cleanupLeftovers).Count
$summary += "Feature-state leftovers in root: " + @($featureLeftovers).Count
$summary += "Cleanup archive expected: " + @($cleanupExpected).Count
$summary += "Cleanup archive present: " + @($cleanupPresent).Count
$summary += "Cleanup archive missing: " + @($cleanupMissing).Count
$summary += "Cleanup archive extra: " + @($cleanupExtra).Count
$summary += "Feature archive expected: " + @($featureExpected).Count
$summary += "Feature archive present: " + @($featurePresent).Count
$summary += "Feature archive missing: " + @($featureMissing).Count
$summary += "Remaining STEP files: " + @($remainingStepFiles).Count
$summary += "Remaining NEXT_STEPS appends: " + @($remainingNextAppends).Count
$summary += "Batch B module rules: " + @($batchBModuleRules).Count
$summary += "Batch C communication: " + @($batchCCommunication).Count
$summary += "Batch D shoutout: " + @($batchDShoutout).Count
$summary += "Batch E channelpoints build: " + @($batchEChannelpointsBuild).Count
$summary += "Batch F dashboard/commands: " + @($batchFDashboardCommands).Count
$summary += "Current run docs still in root: " + @($currentRunDocs).Count
$summary += "Current run appends still in root: " + @($currentRunAppends).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
if (@($errors).Count -gt 0) {
  $summary += "Errors:"
  foreach ($e in $errors) { $summary += "ERROR | " + $e }
  $summary += ""
}
if (@($warnings).Count -gt 0) {
  $summary += "Warnings:"
  foreach ($w in $warnings) { $summary += "WARN | " + $w }
}
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

$rootLines = @()
$rootLines += "STEP557 Project-State Root Files"
$rootLines += ""
foreach ($f in $rootFileObjs) {
  $rootLines += $f.path + " | bytes=" + $f.bytes + " | modified=" + $f.modified
}
$rootLines | Out-File -FilePath $rootPath -Encoding UTF8

$archiveLines = @()
$archiveLines += "STEP557 Archive Verification"
$archiveLines += "ScannerVersion: 0.1.1"
$archiveLines += ""
$archiveLines += "Cleanup archive: " + $cleanupArchiveRel
foreach ($info in $cleanupArchiveStatus) {
  $archiveLines += "CLEANUP_EXPECTED | " + $info.path + " | exists=" + $info.exists + " | bytes=" + $info.bytes
}
$archiveLines += ""
$archiveLines += "Feature archive: " + $featureArchiveRel
foreach ($info in $featureArchiveStatus) {
  $archiveLines += "FEATURE_EXPECTED | " + $info.path + " | exists=" + $info.exists + " | bytes=" + $info.bytes
}
$archiveLines | Out-File -FilePath $archivesPath -Encoding UTF8

$b = @()
$b += "STEP557 Remaining Project-State Buckets"
$b += "ScannerVersion: 0.1.1"
$b += ""
$b += "Batch B - Module Docs / Meta Rules:"
foreach ($f in $batchBModuleRules) { $b += "- " + $f.path }
$b += ""
$b += "Batch C - Communication Bus:"
foreach ($f in $batchCCommunication) { $b += "- " + $f.path }
$b += ""
$b += "Batch D - Shoutout:"
foreach ($f in $batchDShoutout) { $b += "- " + $f.path }
$b += ""
$b += "Batch E - Channelpoints Build:"
foreach ($f in $batchEChannelpointsBuild) { $b += "- " + $f.path }
$b += ""
$b += "Batch F - Dashboard/Commands:"
foreach ($f in $batchFDashboardCommands) { $b += "- " + $f.path }
$b += ""
$b += "Current Run Docs Still In Root:"
foreach ($f in $currentRunDocs) { $b += "- " + $f.path }
$b += ""
$b += "Current Run Appends Still In Root:"
foreach ($f in $currentRunAppends) { $b += "- " + $f.path }
$b | Out-File -FilePath $bucketsPath -Encoding UTF8

Write-Host ""
Write-Host "STEP557 Post-Cleanup Verification fertig."
Write-Host "ScannerVersion: 0.1.1"
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("RootFiles: " + $rootPath)
Write-Host ("Archives: " + $archivesPath)
Write-Host ("Buckets: " + $bucketsPath)
Write-Host ("JSON: " + $jsonPath)
