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

$batchBArchiveRel = "project-state/archive/2026-05-29-step558-module-meta-rules"
$batchBArchiveFull = Join-Path -Path $ProjectRoot -ChildPath ($batchBArchiveRel.Replace("/", "\"))

$cleanupArchiveRel = "project-state/archive/2026-05-29-step554-cleanup-run-notes"
$featureArchiveRel = "project-state/archive/2026-05-29-step549-feature-state-notes"

$coreActive = @(
  "project-state/CHANGELOG.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md",
  "docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md",
  "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
)

$batchBExpected = @(
  "STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md",
  "STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md",
  "STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md",
  "STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE.md",
  "STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md",
  "STEP481_SERVER_LOG_MODULE_META_RULES.md",
  "STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md"
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
    $errors += ("Missing core/current/reference file: " + $rel)
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

$batchBLeftovers = @($rootFileObjs | Where-Object {
  $_.path -like "project-state/STEP476_*" -or
  $_.path -like "project-state/STEP477_*" -or
  $_.path -like "project-state/STEP478_*" -or
  $_.path -like "project-state/STEP479_*" -or
  $_.path -like "project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md" -or
  $_.path -like "project-state/STEP481_SERVER_LOG_MODULE_META_RULES.md" -or
  $_.path -like "project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md"
})
foreach ($l in $batchBLeftovers) {
  $errors += ("Batch B leftover in project-state root: " + $l.path)
}

$featureStateLeftovers = @($rootFileObjs | Where-Object {
  ($_.path -like "project-state/CHANNELPOINTS_*.md" -or $_.path -like "project-state/COMMANDS_*.md") -and
  $_.path -ne "project-state/CHANNELPOINTS_CURRENT_STATE.md" -and
  $_.path -ne "project-state/COMMANDS_CURRENT_STATE.md"
})
foreach ($l in $featureStateLeftovers) {
  $errors += ("Feature-state leftover in project-state root: " + $l.path)
}

$cleanupLeftovers = @($rootFileObjs | Where-Object {
  $_.path -like "project-state/STEP543_*" -or
  $_.path -like "project-state/STEP544_*" -or
  $_.path -like "project-state/STEP545_*" -or
  $_.path -like "project-state/STEP546_*" -or
  $_.path -like "project-state/STEP547_*" -or
  $_.path -like "project-state/STEP548_*" -or
  $_.path -like "project-state/STEP549_*" -or
  $_.path -like "project-state/STEP550_*" -or
  $_.path -like "project-state/STEP551_*" -or
  $_.path -like "project-state/STEP552_*" -or
  $_.path -like "project-state/NEXT_STEPS_STEP543_APPEND.md" -or
  $_.path -like "project-state/NEXT_STEPS_STEP546_APPEND.md" -or
  $_.path -like "project-state/NEXT_STEPS_STEP547_APPEND.md" -or
  $_.path -like "project-state/NEXT_STEPS_STEP548_APPEND.md" -or
  $_.path -like "project-state/NEXT_STEPS_STEP549_APPEND.md"
})
foreach ($l in $cleanupLeftovers) {
  $errors += ("Cleanup batch leftover in project-state root: " + $l.path)
}

$batchBArchiveStatus = @()
$batchBPresent = @()
$batchBMissing = @()
foreach ($name in $batchBExpected) {
  $rel = $batchBArchiveRel + "/" + $name
  $info = Get-Info -Rel $rel
  $batchBArchiveStatus += $info
  if ($info.exists) {
    $batchBPresent += $rel
  } else {
    $batchBMissing += $rel
    $errors += ("Missing Batch B archive file: " + $rel)
  }
}

$batchBExtra = @()
if (Test-Path -LiteralPath $batchBArchiveFull) {
  $archiveFiles = @(Get-ChildItem -LiteralPath $batchBArchiveFull -File -Filter "*.md" | Sort-Object Name)
  foreach ($f in $archiveFiles) {
    if ($batchBExpected -notcontains $f.Name) {
      $extra = To-Rel -FullPath $f.FullName
      $batchBExtra += $extra
      $warnings += ("Extra file in Batch B archive folder: " + $extra)
    }
  }
} else {
  $errors += ("Batch B archive directory missing: " + $batchBArchiveRel)
}

$cleanupArchivePresentCount = 0
foreach ($name in $cleanupExpected) {
  $rel = $cleanupArchiveRel + "/" + $name
  if (Test-Path -LiteralPath (To-Full -Rel $rel)) {
    $cleanupArchivePresentCount++
  }
}

$remainingStepFiles = @($rootFileObjs | Where-Object { $_.path -like "project-state/STEP*.md" })
$remainingNextAppends = @($rootFileObjs | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" })

$batchCCommunication = @($remainingStepFiles | Where-Object { $_.path -match "STEP487_|STEP488_" })
$batchDShoutout = @($remainingStepFiles | Where-Object { $_.path -match "STEP483_|STEP484_SHOUTOUT_|STEP485_|STEP486_" })
$batchEChannelpointsBuild = @($remainingStepFiles | Where-Object { $_.path -match "STEP484_CHANNELPOINTS_|STEP489_|STEP490_|STEP491_|STEP492_|STEP493_|STEP494_" })
$batchFDashboardCommands = @($remainingStepFiles | Where-Object { $_.path -match "STEP495_|STEP496_|STEP497_" })
$currentRunDocs = @($remainingStepFiles | Where-Object { $_.path -match "STEP553_|STEP554_|STEP555_|STEP556_|STEP557_|STEP558_|STEP559_|STEP560_|STEP561_" })

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step562_post_batch_b_verification_summary.txt"
$rootPath = Join-Path -Path $OutDir -ChildPath "step562_project_state_root_files.txt"
$archivesPath = Join-Path -Path $OutDir -ChildPath "step562_archive_verification.txt"
$bucketsPath = Join-Path -Path $OutDir -ChildPath "step562_remaining_project_state_buckets.txt"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step562_post_batch_b_verification.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    rootMdFiles = @($rootFileObjs).Count
    coreActiveChecked = @($coreStatus).Count
    batchBLeftovers = @($batchBLeftovers).Count
    cleanupLeftovers = @($cleanupLeftovers).Count
    featureStateLeftovers = @($featureStateLeftovers).Count
    batchBArchiveExpected = @($batchBExpected).Count
    batchBArchivePresent = @($batchBPresent).Count
    batchBArchiveMissing = @($batchBMissing).Count
    batchBArchiveExtra = @($batchBExtra).Count
    cleanupArchivePresent = $cleanupArchivePresentCount
    remainingStepFiles = @($remainingStepFiles).Count
    remainingNextStepAppends = @($remainingNextAppends).Count
    batchCCommunication = @($batchCCommunication).Count
    batchDShoutout = @($batchDShoutout).Count
    batchEChannelpointsBuild = @($batchEChannelpointsBuild).Count
    batchFDashboardCommands = @($batchFDashboardCommands).Count
    currentRunDocs = @($currentRunDocs).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  coreActive = $coreStatus
  rootFiles = $rootFileObjs
  batchBLeftovers = $batchBLeftovers
  cleanupLeftovers = $cleanupLeftovers
  featureStateLeftovers = $featureStateLeftovers
  batchBArchiveStatus = $batchBArchiveStatus
  remainingStepFiles = $remainingStepFiles
  remainingNextStepAppends = $remainingNextAppends
  buckets = [pscustomobject]@{
    batchCCommunication = $batchCCommunication
    batchDShoutout = $batchDShoutout
    batchEChannelpointsBuild = $batchEChannelpointsBuild
    batchFDashboardCommands = $batchFDashboardCommands
    currentRunDocs = $currentRunDocs
  }
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP562 Post Batch B Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Root md files: " + @($rootFileObjs).Count
$summary += "Core active checked: " + @($coreStatus).Count
$summary += "Batch B leftovers in root: " + @($batchBLeftovers).Count
$summary += "Cleanup leftovers in root: " + @($cleanupLeftovers).Count
$summary += "Feature-state leftovers in root: " + @($featureStateLeftovers).Count
$summary += "Batch B archive expected: " + @($batchBExpected).Count
$summary += "Batch B archive present: " + @($batchBPresent).Count
$summary += "Batch B archive missing: " + @($batchBMissing).Count
$summary += "Batch B archive extra: " + @($batchBExtra).Count
$summary += "Cleanup archive present: " + $cleanupArchivePresentCount
$summary += "Remaining STEP files: " + @($remainingStepFiles).Count
$summary += "Remaining NEXT_STEPS appends: " + @($remainingNextAppends).Count
$summary += "Batch C communication: " + @($batchCCommunication).Count
$summary += "Batch D shoutout: " + @($batchDShoutout).Count
$summary += "Batch E channelpoints build: " + @($batchEChannelpointsBuild).Count
$summary += "Batch F dashboard/commands: " + @($batchFDashboardCommands).Count
$summary += "Current run docs still in root: " + @($currentRunDocs).Count
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
$rootLines += "STEP562 Project-State Root Files"
$rootLines += ""
foreach ($f in $rootFileObjs) {
  $rootLines += $f.path + " | bytes=" + $f.bytes + " | modified=" + $f.modified
}
$rootLines | Out-File -FilePath $rootPath -Encoding UTF8

$archiveLines = @()
$archiveLines += "STEP562 Archive Verification"
$archiveLines += ""
$archiveLines += "Batch B archive: " + $batchBArchiveRel
foreach ($info in $batchBArchiveStatus) {
  $archiveLines += "BATCH_B_EXPECTED | " + $info.path + " | exists=" + $info.exists + " | bytes=" + $info.bytes
}
$archiveLines += ""
$archiveLines += "Cleanup archive present count: " + $cleanupArchivePresentCount
$archiveLines | Out-File -FilePath $archivesPath -Encoding UTF8

$b = @()
$b += "STEP562 Remaining Project-State Buckets"
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
$b += "Remaining NEXT_STEPS Appends:"
foreach ($f in $remainingNextAppends) { $b += "- " + $f.path }
$b | Out-File -FilePath $bucketsPath -Encoding UTF8

Write-Host ""
Write-Host "STEP562 Post Batch B Verification fertig."
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("RootFiles: " + $rootPath)
Write-Host ("Archives: " + $archivesPath)
Write-Host ("Buckets: " + $bucketsPath)
Write-Host ("JSON: " + $jsonPath)
