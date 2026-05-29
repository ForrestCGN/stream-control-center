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

$targetArchiveDir = "project-state/archive/2026-05-29-step554-cleanup-run-notes"

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

$plan = @()
foreach ($p in $cleanupRunFiles) {
  $plan += New-ItemInfo -RelPath $p
}

$protectedItems = @()
foreach ($p in $protected) {
  $protectedItems += New-ItemInfo -RelPath $p
}

$missing = @($plan | Where-Object { $_.sourceExists -ne $true })
$targetConflicts = @($plan | Where-Object { $_.targetExists -eq $true })

foreach ($m in $missing) {
  $errors += ("Missing source: " + $m.source)
}
foreach ($c in $targetConflicts) {
  $errors += ("Target already exists: " + $c.target)
}

foreach ($p in $protectedItems) {
  if (-not $p.sourceExists) {
    $warnings += ("Protected/reference file not found: " + $p.source)
  }
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step555_cleanup_run_notes_archive_dryrun_summary.txt"
$dryrunPath = Join-Path -Path $OutDir -ChildPath "step555_cleanup_run_notes_archive_dryrun.txt"
$manifestPath = Join-Path -Path $OutDir -ChildPath "step555_cleanup_run_notes_archive_manifest.md"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step555_cleanup_run_notes_archive_dryrun.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    targetArchiveDir = $targetArchiveDir
    mode = "DRY_RUN_ONLY"
    plannedFiles = @($cleanupRunFiles).Count
    sourceMissing = @($missing).Count
    targetConflicts = @($targetConflicts).Count
    protectedFilesChecked = @($protectedItems).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  plan = $plan
  protected = $protectedItems
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP555 Cleanup Run Notes Archive Dry-Run Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "TargetArchiveDir: " + $targetArchiveDir
$summary += "Mode: DRY_RUN_ONLY"
$summary += "Planned files: " + @($cleanupRunFiles).Count
$summary += "Source missing: " + @($missing).Count
$summary += "Target conflicts: " + @($targetConflicts).Count
$summary += "Protected files checked: " + @($protectedItems).Count
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
  $summary += ""
}
$summary += "Important:"
$summary += "- Dry-run only."
$summary += "- Nothing was moved."
$summary += "- PROJECT_STATE_CLEANUP_RUN_HISTORY.md must stay active."
$summary += "- Core/current files must stay active."
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

$dry = @()
$dry += "STEP555 Cleanup Run Notes Archive Dry-Run"
$dry += ""
foreach ($entry in $plan) {
  if ($entry.sourceExists -eq $true) {
    $dry += "WOULD_MOVE | " + $entry.source + " -> " + $entry.target + " | bytes=" + $entry.bytes + " | targetExists=" + $entry.targetExists
  } else {
    $dry += "MISSING | " + $entry.source + " -> " + $entry.target
  }
}
$dry += ""
$dry += "Protected/reference files - must NOT move:"
foreach ($entry in $protectedItems) {
  $dry += "PROTECTED | " + $entry.source + " | exists=" + $entry.sourceExists + " | bytes=" + $entry.bytes
}
$dry | Out-File -FilePath $dryrunPath -Encoding UTF8

$manifest = @()
$manifest += "# STEP555 Cleanup Run Notes Archive Manifest"
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
$manifest += "Protected/reference files not included:"
foreach ($entry in $protectedItems) {
  $manifest += "- " + $entry.source
}
$manifest += ""
$manifest += "Safety exclusions:"
$manifest += "- project-state core files"
$manifest += "- project-state/CHANNELPOINTS_CURRENT_STATE.md"
$manifest += "- project-state/COMMANDS_CURRENT_STATE.md"
$manifest += "- docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
$manifest += "- project-state/archive/*"
$manifest += "- STEP476-STEP497 older root files"
$manifest | Out-File -FilePath $manifestPath -Encoding UTF8

Write-Host ""
Write-Host "STEP555 Cleanup Run Notes Archive Dry-Run fertig."
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("DryRun: " + $dryrunPath)
Write-Host ("Manifest: " + $manifestPath)
Write-Host ("JSON: " + $jsonPath)
