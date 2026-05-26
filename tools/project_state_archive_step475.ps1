# STEP475 project-state archive cleanup
# Verschiebt alte STEP-/APPEND-/Snapshot-Dateien aus project-state/ in project-state/archive/*.
# Löscht keine Dateien.

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$projectState = Join-Path $repoRoot "project-state"

if (!(Test-Path $projectState)) {
  throw "project-state nicht gefunden: $projectState"
}

$keep = @(
  "CURRENT_STATUS.md",
  "CHANGELOG.md",
  "FILES.md",
  "NEXT_STEPS.md",
  "TODO.md",
  "GENERAL_PROJECT_PROMPT.md",
  "README.md",
  "PROJECT_STATE_ARCHIVE_MOVE_LIST_2026-05-26.csv"
)

$archiveRoot = Join-Path $projectState "archive"
$dirs = @("steps", "append", "old-status", "generated-snapshots", "misc")
foreach ($d in $dirs) {
  New-Item -ItemType Directory -Force -Path (Join-Path $archiveRoot $d) | Out-Null
}

function Get-ArchiveCategory([string]$name) {
  $upper = $name.ToUpperInvariant()
  if ($upper.Contains("STEP")) { return "steps" }
  if ($upper.Contains("APPEND")) { return "append" }
  if ($upper.Contains("CURRENT_STATUS_") -or $upper.Contains("STATUS_") -or $upper.Contains("SYSTEM_STATUS_") -or $upper.Contains("NEXT_STEPS_") -or $upper.Contains("CHANGELOG_") -or $upper.Contains("FILES_") -or $upper.Contains("TODO_")) { return "old-status" }
  if ($upper.Contains("MAP") -or $upper.Contains("OVERVIEW") -or $upper.Contains("REPORT") -or $upper.Contains("SNAPSHOT") -or $upper.Contains("INSPECTION") -or $upper.Contains("INVENTORY")) { return "generated-snapshots" }
  return "misc"
}

$moved = 0
$skipped = 0
Get-ChildItem -Path $projectState -File | ForEach-Object {
  $name = $_.Name
  if ($keep -contains $name) {
    $script:skipped++
    return
  }

  $category = Get-ArchiveCategory $name
  $targetDir = Join-Path $archiveRoot $category
  $target = Join-Path $targetDir $name

  if (Test-Path $target) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($name)
    $ext = [System.IO.Path]::GetExtension($name)
    $stamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $target = Join-Path $targetDir "$base.$stamp$ext"
  }

  Move-Item -LiteralPath $_.FullName -Destination $target
  $script:moved++
}

Write-Host "project-state cleanup erledigt. Verschoben: $moved, behalten: $skipped"
Write-Host "Archiv: $archiveRoot"
