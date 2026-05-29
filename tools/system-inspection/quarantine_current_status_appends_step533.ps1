param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

$targets = @(
  "docs/current/CURRENT_SYSTEM_STATUS_STEP363_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP364_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP365_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP366_KNOWN_ISSUE_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP367_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP368_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP369_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP370_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP371_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP392_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP393_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP393A_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP394_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP395_APPEND.md",
  "docs/current/CURRENT_SYSTEM_STATUS_STEP396_APPEND.md"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$quarantineRoot = Join-Path $ProjectRoot ("_cleanup_quarantine\STEP533_CURRENT_STATUS_APPENDS_" + $timestamp)
$reportLines = @()

$reportLines += "STEP533 Current Status Append Quarantine"
$reportLines += ("Generated: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
$reportLines += ("ProjectRoot: " + $ProjectRoot)
$reportLines += ("Apply: " + $Apply.IsPresent)
$reportLines += ""

if ($Apply) {
  New-Item -ItemType Directory -Force -Path $quarantineRoot | Out-Null
}

foreach ($rel in $targets) {
  $src = Join-Path $ProjectRoot $rel

  if (-not (Test-Path $src)) {
    $reportLines += ("MISSING | " + $rel)
    continue
  }

  $dest = Join-Path $quarantineRoot $rel
  $destDir = Split-Path $dest -Parent

  if ($Apply) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    Move-Item -Path $src -Destination $dest -Force
    $reportLines += ("MOVED | " + $rel + " -> " + $dest)
  } else {
    $reportLines += ("WOULD_MOVE | " + $rel)
  }
}

if ($Apply) {
  $reportPath = Join-Path $quarantineRoot "STEP533_QUARANTINE_REPORT.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP533 Quarantine fertig."
  Write-Host ("Report: " + $reportPath)
} else {
  $outDir = Join-Path $ProjectRoot "system-scan-output"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $reportPath = Join-Path $outDir "step533_current_status_appends_dryrun.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP533 Dry-Run fertig."
  Write-Host ("Report: " + $reportPath)
}
