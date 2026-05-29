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

$targetArchiveDir = "project-state/archive/2026-05-29-step544-project-state-batch-a"

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
  $localChild = $RelPath.Replace("/", "\")
  return Join-Path -Path $ProjectRoot -ChildPath $localChild
}

function New-PlanItem {
  param([string]$RelPath)

  $full = Convert-ToLocalPath -RelPath $RelPath
  $target = $targetArchiveDir + "/" + [System.IO.Path]::GetFileName($RelPath)

  if (Test-Path -LiteralPath $full) {
    $item = Get-Item -LiteralPath $full
    return [pscustomobject]@{
      path = $RelPath
      exists = $true
      bytes = $item.Length
      modified = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
      target = $target
    }
  }

  return [pscustomobject]@{
    path = $RelPath
    exists = $false
    bytes = 0
    modified = ""
    target = $target
  }
}

$items = @()
foreach ($entry in $batchA) {
  $items += New-PlanItem -RelPath $entry
}

$protectedItems = @()
foreach ($entry in $protected) {
  $protectedItems += New-PlanItem -RelPath $entry
}

$existingCount = @($items | Where-Object { $_.exists -eq $true }).Count
$missingCount = @($items | Where-Object { $_.exists -ne $true }).Count

$summaryPath = Join-Path -Path $OutDir -ChildPath "step544_project_state_batch_a_dryrun_summary.txt"
$dryrunPath = Join-Path -Path $OutDir -ChildPath "step544_project_state_batch_a_dryrun.txt"
$rescueIndexPath = Join-Path -Path $OutDir -ChildPath "step544_project_state_batch_a_rescue_index.md"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step544_project_state_batch_a_dryrun.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    projectRoot = $ProjectRoot
    targetArchiveDir = $targetArchiveDir
    plannedFiles = @($batchA).Count
    existingFiles = $existingCount
    missingFiles = $missingCount
    protectedFiles = @($protectedItems).Count
    mode = "DRY_RUN_ONLY"
  }
  plannedMoves = $items
  protected = $protectedItems
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summaryLines = @()
$summaryLines += "STEP544 Project-State Batch A Dry-Run Summary"
$summaryLines += "Generated: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$summaryLines += "ProjectRoot: " + $ProjectRoot
$summaryLines += "TargetArchiveDir: " + $targetArchiveDir
$summaryLines += "Planned files: " + @($batchA).Count
$summaryLines += "Existing files: " + $existingCount
$summaryLines += "Missing files: " + $missingCount
$summaryLines += "Protected core files checked: " + @($protectedItems).Count
$summaryLines += ""
$summaryLines += "Important:"
$summaryLines += "- Dry-run only."
$summaryLines += "- Nothing was moved."
$summaryLines += "- No project-state core files are part of Batch A."
$summaryLines += "- If missing files > 0, do not apply a move script before review."
$summaryLines | Out-File -FilePath $summaryPath -Encoding UTF8

$dryLines = @()
$dryLines += "STEP544 Project-State Batch A Dry-Run"
$dryLines += ""
foreach ($item in $items) {
  if ($item.exists -eq $true) {
    $dryLines += "WOULD_MOVE | " + $item.path + " -> " + $item.target + " | bytes=" + $item.bytes + " | modified=" + $item.modified
  } else {
    $dryLines += "MISSING | " + $item.path + " -> " + $item.target
  }
}
$dryLines += ""
$dryLines += "Protected core files - must NOT move:"
foreach ($item in $protectedItems) {
  $dryLines += "PROTECTED | " + $item.path + " | exists=" + $item.exists + " | bytes=" + $item.bytes + " | modified=" + $item.modified
}
$dryLines | Out-File -FilePath $dryrunPath -Encoding UTF8

$rescueLines = @()
$rescueLines += "# STEP544 Project-State Batch A Rescue Index"
$rescueLines += ""
$rescueLines += "Generated: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$rescueLines += ""
$rescueLines += "Purpose: Index Project-State Batch A before later archive/quarantine."
$rescueLines += ""
$rescueLines += "No files are moved by STEP544."
$rescueLines += ""
$rescueLines += "Target archive directory:"
$rescueLines += $targetArchiveDir
$rescueLines += ""
$rescueLines += "Planned Batch A files:"
foreach ($item in $items) {
  $rescueLines += "- SOURCE: " + $item.path
  $rescueLines += "  TARGET: " + $item.target
  $rescueLines += "  EXISTS: " + $item.exists
  $rescueLines += "  BYTES: " + $item.bytes
  $rescueLines += "  MODIFIED: " + $item.modified
}
$rescueLines += ""
$rescueLines += "Protected core files:"
foreach ($item in $protectedItems) {
  $rescueLines += "- " + $item.path
}
$rescueLines += ""
$rescueLines += "Safety:"
$rescueLines += "- Do not move anything if missingFiles > 0 without review."
$rescueLines += "- Do not include STEP476-STEP497 in Batch A."
$rescueLines += "- Do not include CHANNELPOINTS_*.md or COMMANDS_*.md."
$rescueLines += "- Do not include project-state/archive/*."
$rescueLines += "- Do not include project-state core files."
$rescueLines | Out-File -FilePath $rescueIndexPath -Encoding UTF8

Write-Host ""
Write-Host "STEP544 Project-State Batch A Dry-Run fertig."
Write-Host ("Summary: " + $summaryPath)
Write-Host ("DryRun: " + $dryrunPath)
Write-Host ("RescueIndex: " + $rescueIndexPath)
Write-Host ("JSON: " + $jsonPath)
