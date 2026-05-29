param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

if (-not $Apply) {
  Write-Host "ABBRUCH: Dieses Script verschiebt Dateien nur mit -Apply."
  Write-Host "Erst Backup erstellen, dann Dry-Run prüfen, dann:"
  Write-Host "powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\cleanup_batch1_quarantine.ps1 -Apply"
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$quarantineRoot = Join-Path $ProjectRoot ("_cleanup_quarantine\STEP530_" + $timestamp)
New-Item -ItemType Directory -Force -Path $quarantineRoot | Out-Null

$candidates = @(
  "_live_copy_backup",
  "backend/modules/birthday.js.step275b.bak",
  "backend/modules/media.js.step275a.bak",
  "backend/modules/sound_system.js.step275a.bak",
  "htdocs/dashboard/app.js.bak_STEP274B",
  "htdocs/dashboard/index.html.bak_STEP274B"
)

$reportPath = Join-Path $quarantineRoot "STEP530_QUARANTINE_REPORT.txt"
$report = @()
$report += "STEP530 Cleanup Batch 1 Quarantine Report"
$report += ("Generated: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
$report += ("ProjectRoot: " + $ProjectRoot)
$report += ("QuarantineRoot: " + $quarantineRoot)
$report += ""

foreach ($candidate in $candidates) {
  $source = Join-Path $ProjectRoot $candidate

  if (-not (Test-Path $source)) {
    $report += ("MISSING | " + $candidate)
    continue
  }

  $target = Join-Path $quarantineRoot $candidate
  $targetParent = Split-Path $target -Parent
  New-Item -ItemType Directory -Force -Path $targetParent | Out-Null

  Move-Item -Path $source -Destination $target -Force
  $report += ("MOVED | " + $candidate + " -> " + $target)
}

$report += ""
$report += "Hinweis:"
$report += "- Es wurde nichts endgültig gelöscht."
$report += "- Dateien wurden nach _cleanup_quarantine verschoben."
$report += "- Wenn alles sauber ist, kann später entschieden werden, ob _cleanup_quarantine aus dem Repo entfernt oder extern archiviert wird."

$report | Out-File $reportPath -Encoding utf8

Write-Host ""
Write-Host "Quarantine-Cleanup fertig."
Write-Host ("Report: " + $reportPath)
Write-Host ""
Write-Host "Danach prüfen:"
Write-Host "git status"
Write-Host "node --check backend\server.js"
Write-Host "npm test  # falls später echte Tests eingerichtet sind"
