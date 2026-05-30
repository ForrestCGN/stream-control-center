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

$shoutoutArchiveRel = "project-state/archive/2026-05-30-step568-shoutout-state"
$shoutoutArchiveFull = Join-Path -Path $ProjectRoot -ChildPath ($shoutoutArchiveRel.Replace("/", "\"))

$communicationArchiveRel = "project-state/archive/2026-05-30-step563-communication-bus-contract"
$batchBArchiveRel = "project-state/archive/2026-05-29-step558-module-meta-rules"

$coreActive = @(
  "project-state/CHANGELOG.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md",
  "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md",
  "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md",
  "docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md",
  "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
)

$shoutoutExpected = @(
  "STEP483_SHOUTOUT_DASHBOARD_TABS.md",
  "STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md",
  "STEP485_SHOUTOUT_PRODUCTION_CHECK.md",
  "STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md"
)

$communicationExpected = @(
  "STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md",
  "STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md"
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
  $rootFileObjs += [pscustomObject]@{
    path = To-Rel -FullPath $f.FullName
    bytes = $f.Length
    modified = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  }
}

$shoutoutLeftovers = @($rootFileObjs | Where-Object {
  $_.path -like "project-state/STEP483_SHOUTOUT_*" -or
  $_.path -like "project-state/STEP484_SHOUTOUT_*" -or
  $_.path -like "project-state/STEP485_SHOUTOUT_*" -or
  $_.path -like "project-state/STEP486_SHOUTOUT_*"
})
foreach ($l in $shoutoutLeftovers) {
  $errors += ("Shoutout leftover in project-state root: " + $l.path)
}

$communicationLeftovers = @($rootFileObjs | Where-Object {
  $_.path -like "project-state/STEP487_*" -or
  $_.path -like "project-state/STEP488_*"
})
foreach ($l in $communicationLeftovers) {
  $errors += ("Communication Bus leftover in project-state root: " + $l.path)
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

$shoutoutArchiveStatus = @()
$shoutoutPresent = @()
$shoutoutMissing = @()
foreach ($name in $shoutoutExpected) {
  $rel = $shoutoutArchiveRel + "/" + $name
  $info = Get-Info -Rel $rel
  $shoutoutArchiveStatus += $info
  if ($info.exists) {
    $shoutoutPresent += $rel
  } else {
    $shoutoutMissing += $rel
    $errors += ("Missing Shoutout archive file: " + $rel)
  }
}

$shoutoutExtra = @()
if (Test-Path -LiteralPath $shoutoutArchiveFull) {
  $archiveFiles = @(Get-ChildItem -LiteralPath $shoutoutArchiveFull -File -Filter "*.md" | Sort-Object Name)
  foreach ($f in $archiveFiles) {
    if ($shoutoutExpected -notcontains $f.Name) {
      $extra = To-Rel -FullPath $f.FullName
      $shoutoutExtra += $extra
      $warnings += ("Extra file in Shoutout archive folder: " + $extra)
    }
  }
} else {
  $errors += ("Shoutout archive directory missing: " + $shoutoutArchiveRel)
}

$communicationPresentCount = 0
foreach ($name in $communicationExpected) {
  $rel = $communicationArchiveRel + "/" + $name
  if (Test-Path -LiteralPath (To-Full -Rel $rel)) {
    $communicationPresentCount++
  }
}

$batchBPresentCount = 0
foreach ($name in $batchBExpected) {
  $rel = $batchBArchiveRel + "/" + $name
  if (Test-Path -LiteralPath (To-Full -Rel $rel)) {
    $batchBPresentCount++
  }
}

$remainingStepFiles = @($rootFileObjs | Where-Object { $_.path -like "project-state/STEP*.md" })
$remainingNextAppends = @($rootFileObjs | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" })

$batchEChannelpointsBuild = @($remainingStepFiles | Where-Object { $_.path -match "STEP484_CHANNELPOINTS_|STEP489_|STEP490_|STEP491_|STEP492_|STEP493_|STEP494_" })
$batchFDashboardCommands = @($remainingStepFiles | Where-Object { $_.path -match "STEP495_|STEP496_|STEP497_" })
$currentRunDocs = @($remainingStepFiles | Where-Object { $_.path -match "STEP553_|STEP554_|STEP555_|STEP556_|STEP557_|STEP558_|STEP559_|STEP560_|STEP561_|STEP562_|STEP563_|STEP564_|STEP565_|STEP566_|STEP567_|STEP568_|STEP569_|STEP570_|STEP571_" })

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step572_post_shoutout_verification_summary.txt"
$rootPath = Join-Path -Path $OutDir -ChildPath "step572_project_state_root_files.txt"
$archivesPath = Join-Path -Path $OutDir -ChildPath "step572_archive_verification.txt"
$bucketsPath = Join-Path -Path $OutDir -ChildPath "step572_remaining_project_state_buckets.txt"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step572_post_shoutout_verification.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    rootMdFiles = @($rootFileObjs).Count
    coreActiveChecked = @($coreStatus).Count
    shoutoutLeftovers = @($shoutoutLeftovers).Count
    communicationLeftovers = @($communicationLeftovers).Count
    batchBLeftovers = @($batchBLeftovers).Count
    featureStateLeftovers = @($featureStateLeftovers).Count
    shoutoutArchiveExpected = @($shoutoutExpected).Count
    shoutoutArchivePresent = @($shoutoutPresent).Count
    shoutoutArchiveMissing = @($shoutoutMissing).Count
    shoutoutArchiveExtra = @($shoutoutExtra).Count
    communicationArchivePresent = $communicationPresentCount
    batchBArchivePresent = $batchBPresentCount
    remainingStepFiles = @($remainingStepFiles).Count
    remainingNextStepAppends = @($remainingNextAppends).Count
    batchEChannelpointsBuild = @($batchEChannelpointsBuild).Count
    batchFDashboardCommands = @($batchFDashboardCommands).Count
    currentRunDocs = @($currentRunDocs).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  coreActive = $coreStatus
  rootFiles = $rootFileObjs
  shoutoutLeftovers = $shoutoutLeftovers
  communicationLeftovers = $communicationLeftovers
  batchBLeftovers = $batchBLeftovers
  featureStateLeftovers = $featureStateLeftovers
  shoutoutArchiveStatus = $shoutoutArchiveStatus
  remainingStepFiles = $remainingStepFiles
  remainingNextStepAppends = $remainingNextAppends
  buckets = [pscustomobject]@{
    batchEChannelpointsBuild = $batchEChannelpointsBuild
    batchFDashboardCommands = $batchFDashboardCommands
    currentRunDocs = $currentRunDocs
  }
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP572 Post Shoutout Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Root md files: " + @($rootFileObjs).Count
$summary += "Core active checked: " + @($coreStatus).Count
$summary += "Shoutout leftovers in root: " + @($shoutoutLeftovers).Count
$summary += "Communication Bus leftovers in root: " + @($communicationLeftovers).Count
$summary += "Batch B leftovers in root: " + @($batchBLeftovers).Count
$summary += "Feature-state leftovers in root: " + @($featureStateLeftovers).Count
$summary += "Shoutout archive expected: " + @($shoutoutExpected).Count
$summary += "Shoutout archive present: " + @($shoutoutPresent).Count
$summary += "Shoutout archive missing: " + @($shoutoutMissing).Count
$summary += "Shoutout archive extra: " + @($shoutoutExtra).Count
$summary += "Communication archive present: " + $communicationPresentCount
$summary += "Batch B archive present: " + $batchBPresentCount
$summary += "Remaining STEP files: " + @($remainingStepFiles).Count
$summary += "Remaining NEXT_STEPS appends: " + @($remainingNextAppends).Count
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
$rootLines += "STEP572 Project-State Root Files"
$rootLines += ""
foreach ($f in $rootFileObjs) {
  $rootLines += $f.path + " | bytes=" + $f.bytes + " | modified=" + $f.modified
}
$rootLines | Out-File -FilePath $rootPath -Encoding UTF8

$archiveLines = @()
$archiveLines += "STEP572 Archive Verification"
$archiveLines += ""
$archiveLines += "Shoutout archive: " + $shoutoutArchiveRel
foreach ($info in $shoutoutArchiveStatus) {
  $archiveLines += "SHOUTOUT_EXPECTED | " + $info.path + " | exists=" + $info.exists + " | bytes=" + $info.bytes
}
$archiveLines += ""
$archiveLines += "Communication archive present count: " + $communicationPresentCount
$archiveLines += "Batch B archive present count: " + $batchBPresentCount
$archiveLines | Out-File -FilePath $archivesPath -Encoding UTF8

$b = @()
$b += "STEP572 Remaining Project-State Buckets"
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
Write-Host "STEP572 Post Shoutout Verification fertig."
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("RootFiles: " + $rootPath)
Write-Host ("Archives: " + $archivesPath)
Write-Host ("Buckets: " + $bucketsPath)
Write-Host ("JSON: " + $jsonPath)
