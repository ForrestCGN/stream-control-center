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
$archiveRel = "project-state/archive/2026-05-30-step583-current-run-docs"
$archiveFull = Join-Path -Path $ProjectRoot -ChildPath ($archiveRel.Replace("/", "\"))

$expected = @(
  "STEP553_REMAINING_PROJECT_STATE_ROOT_CLEANUP_PLAN.md",
  "STEP554_CLEANUP_RUN_NOTES_RESCUE_AND_DRYRUN_PLAN.md",
  "STEP555_CLEANUP_RUN_NOTES_ARCHIVE_DRYRUN.md",
  "STEP556_CLEANUP_RUN_NOTES_ARCHIVE_APPLY.md",
  "STEP557_POST_CLEANUP_PROJECT_STATE_VERIFICATION_SCAN.md",
  "STEP558_MODULE_META_RULES_CONSOLIDATION_PLAN.md",
  "STEP559_BATCH_B_CONTENT_RESCUE_DRAFT.md",
  "STEP560_BATCH_B_MODULE_META_RULES_ARCHIVE_DRYRUN.md",
  "STEP561_BATCH_B_MODULE_META_RULES_ARCHIVE_APPLY.md",
  "STEP562_POST_BATCH_B_VERIFICATION_SCAN.md",
  "STEP563_COMMUNICATION_BUS_STATE_CONSOLIDATION_PLAN.md",
  "STEP564_COMMUNICATION_BUS_CONTENT_RESCUE_DRAFT.md",
  "STEP565_COMMUNICATION_BUS_ARCHIVE_DRYRUN.md",
  "STEP566_COMMUNICATION_BUS_ARCHIVE_APPLY.md",
  "STEP567_POST_COMMUNICATION_BUS_VERIFICATION_SCAN.md",
  "STEP568_SHOUTOUT_STATE_CONSOLIDATION_PLAN.md",
  "STEP569_SHOUTOUT_CONTENT_RESCUE_DRAFT.md",
  "STEP570_SHOUTOUT_ARCHIVE_DRYRUN.md",
  "STEP571_SHOUTOUT_ARCHIVE_APPLY.md",
  "STEP572_POST_SHOUTOUT_VERIFICATION_SCAN.md",
  "STEP573_CHANNELPOINTS_BUILD_STATE_CONSOLIDATION_PLAN.md",
  "STEP574_CHANNELPOINTS_BUILD_CONTENT_RESCUE_DRAFT.md",
  "STEP575_CHANNELPOINTS_BUILD_ARCHIVE_DRYRUN.md",
  "STEP576_CHANNELPOINTS_BUILD_ARCHIVE_APPLY.md",
  "STEP577_POST_CHANNELPOINTS_BUILD_VERIFICATION_SCAN.md",
  "STEP578_DASHBOARD_COMMANDS_STATE_CONSOLIDATION_PLAN.md",
  "STEP579_DASHBOARD_COMMANDS_CONTENT_RESCUE_DRAFT.md",
  "STEP580_DASHBOARD_COMMANDS_ARCHIVE_DRYRUN.md",
  "STEP581_DASHBOARD_COMMANDS_ARCHIVE_APPLY.md",
  "STEP582_POST_DASHBOARD_COMMANDS_VERIFICATION_SCAN.md",
  "STEP583_CURRENT_RUN_DOCS_CLEANUP_PLAN.md",
  "STEP584_CURRENT_RUN_DOCS_RESCUE_HISTORY_APPEND.md",
  "STEP585_CURRENT_RUN_DOCS_ARCHIVE_DRYRUN.md",
  "NEXT_STEPS_STEP553_APPEND.md",
  "NEXT_STEPS_STEP554_APPEND.md",
  "NEXT_STEPS_STEP558_APPEND.md",
  "NEXT_STEPS_STEP559_APPEND.md",
  "NEXT_STEPS_STEP563_APPEND.md",
  "NEXT_STEPS_STEP564_APPEND.md",
  "NEXT_STEPS_STEP568_APPEND.md",
  "NEXT_STEPS_STEP569_APPEND.md",
  "NEXT_STEPS_STEP573_APPEND.md",
  "NEXT_STEPS_STEP574_APPEND.md",
  "NEXT_STEPS_STEP578_APPEND.md",
  "NEXT_STEPS_STEP579_APPEND.md",
  "NEXT_STEPS_STEP583_APPEND.md"
)

$coreActive = @(
  "project-state/CHANGELOG.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md",
  "project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md",
  "project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md",
  "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md",
  "docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md",
  "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md",
  "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md",
  "docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md",
  "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
)

$allowedRootStepDocs = @(
  "project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md",
  "project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md"
)

function To-Full {
  param([string]$Rel)
  return Join-Path -Path $ProjectRoot -ChildPath ($Rel.Replace("/", "\"))
}

function To-Rel {
  param([string]$FullPath)
  $full = [System.IO.Path]::GetFullPath($FullPath)
  $rootFull = [System.IO.Path]::GetFullPath($ProjectRoot)
  return $full.Substring($rootFull.Length).TrimStart("\").Replace("\", "/")
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

$coreStatus = @()
foreach ($rel in $coreActive) {
  $info = Get-Info -Rel $rel
  $coreStatus += $info
  if (-not $info.exists) {
    $errors += ("Missing active/core file: " + $rel)
  }
}

if (-not (Test-Path -LiteralPath $projectStateDir)) {
  $errors += "project-state directory missing"
}

$rootMd = @()
if (Test-Path -LiteralPath $projectStateDir) {
  $rootMd = @(Get-ChildItem -LiteralPath $projectStateDir -File -Filter "*.md" | Sort-Object Name)
}

$rootFiles = @()
foreach ($f in $rootMd) {
  $rootFiles += [pscustomobject]@{
    path = To-Rel -FullPath $f.FullName
    bytes = $f.Length
    modified = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  }
}

$currentRunRoot = @($rootFiles | Where-Object {
  ($_.path -like "project-state/STEP55*.md" -or
   $_.path -like "project-state/STEP56*.md" -or
   $_.path -like "project-state/STEP57*.md" -or
   $_.path -like "project-state/STEP58*.md" -or
   $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md") -and
   ($allowedRootStepDocs -notcontains $_.path)
})

foreach ($f in $currentRunRoot) {
  $errors += ("Current run doc still in root: " + $f.path)
}

$expectedStatus = @()
$missing = @()
foreach ($name in $expected) {
  $rel = $archiveRel + "/" + $name
  $info = Get-Info -Rel $rel
  $expectedStatus += $info
  if (-not $info.exists) {
    $missing += $rel
    $errors += ("Missing archive file: " + $rel)
  }
}

$extra = @()
if (Test-Path -LiteralPath $archiveFull) {
  $archiveFiles = @(Get-ChildItem -LiteralPath $archiveFull -File -Filter "*.md" | Sort-Object Name)
  foreach ($f in $archiveFiles) {
    if ($expected -notcontains $f.Name) {
      $extraRel = To-Rel -FullPath $f.FullName
      $extra += $extraRel
      $warnings += ("Extra archive file: " + $extraRel)
    }
  }
} else {
  $errors += ("Archive directory missing: " + $archiveRel)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step587_post_current_run_docs_verification_summary.txt"
$rootPath = Join-Path -Path $OutDir -ChildPath "step587_project_state_root_files.txt"
$archivePath = Join-Path -Path $OutDir -ChildPath "step587_current_run_docs_archive_verification.txt"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step587_post_current_run_docs_verification.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    rootMdFiles = @($rootFiles).Count
    activeCoreChecked = @($coreStatus).Count
    allowedRootStepDocs = @($allowedRootStepDocs).Count
    currentRunDocsInRoot = @($currentRunRoot).Count
    nextStepsStepAppendsInRoot = @($rootFiles | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" }).Count
    archiveExpected = @($expected).Count
    archivePresent = @($expectedStatus | Where-Object { $_.exists }).Count
    archiveMissing = @($missing).Count
    archiveExtra = @($extra).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  activeCore = $coreStatus
  allowedRootStepDocs = $allowedRootStepDocs
  rootFiles = $rootFiles
  currentRunDocsInRoot = $currentRunRoot
  archiveStatus = $expectedStatus
  archiveExtra = $extra
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP587 Post Current Run Docs Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Root md files: " + @($rootFiles).Count
$summary += "Active/core checked: " + @($coreStatus).Count
$summary += "Allowed root STEP docs: " + @($allowedRootStepDocs).Count
$summary += "Current run docs in root: " + @($currentRunRoot).Count
$summary += "NEXT_STEPS_STEP appends in root: " + @($rootFiles | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" }).Count
$summary += "Archive expected: " + @($expected).Count
$summary += "Archive present: " + @($expectedStatus | Where-Object { $_.exists }).Count
$summary += "Archive missing: " + @($missing).Count
$summary += "Archive extra: " + @($extra).Count
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
$rootLines += "STEP587 Project-State Root Files"
$rootLines += ""
foreach ($f in $rootFiles) {
  $rootLines += $f.path + " | bytes=" + $f.bytes + " | modified=" + $f.modified
}
$rootLines | Out-File -FilePath $rootPath -Encoding UTF8

$archiveLines = @()
$archiveLines += "STEP587 Current Run Docs Archive Verification"
$archiveLines += "Archive: " + $archiveRel
$archiveLines += ""
foreach ($info in $expectedStatus) {
  $archiveLines += "EXPECTED | " + $info.path + " | exists=" + $info.exists + " | bytes=" + $info.bytes
}
if (@($extra).Count -gt 0) {
  $archiveLines += ""
  $archiveLines += "Extra:"
  foreach ($e in $extra) { $archiveLines += "EXTRA | " + $e }
}
$archiveLines | Out-File -FilePath $archivePath -Encoding UTF8

Write-Host ""
Write-Host "STEP587 Post Current Run Docs Verification fertig."
Write-Host ("Root md files: " + @($rootFiles).Count)
Write-Host ("Active/core checked: " + @($coreStatus).Count)
Write-Host ("Allowed root STEP docs: " + @($allowedRootStepDocs).Count)
Write-Host ("Current run docs in root: " + @($currentRunRoot).Count)
Write-Host ("NEXT_STEPS_STEP appends in root: " + @($rootFiles | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" }).Count)
Write-Host ("Archive expected: " + @($expected).Count)
Write-Host ("Archive present: " + @($expectedStatus | Where-Object { $_.exists }).Count)
Write-Host ("Archive missing: " + @($missing).Count)
Write-Host ("Archive extra: " + @($extra).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("RootFiles: " + $rootPath)
Write-Host ("Archive: " + $archivePath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Root md files: " + @($rootFiles).Count)
Write-Host ("Active/core checked: " + @($coreStatus).Count)
Write-Host ("Allowed root STEP docs: " + @($allowedRootStepDocs).Count)
Write-Host ("Current run docs in root: " + @($currentRunRoot).Count)
Write-Host ("NEXT_STEPS_STEP appends in root: " + @($rootFiles | Where-Object { $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md" }).Count)
Write-Host ("Archive expected: " + @($expected).Count)
Write-Host ("Archive present: " + @($expectedStatus | Where-Object { $_.exists }).Count)
Write-Host ("Archive missing: " + @($missing).Count)
Write-Host ("Archive extra: " + @($extra).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
