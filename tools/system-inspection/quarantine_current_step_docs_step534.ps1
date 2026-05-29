param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

$targets = @(
  "docs/current/STEP201_MODULE_MATRIX_2026-05-08.csv",
  "docs/current/STEP202_1_SOUNDALERTS_EVENTS_LIMIT_100.md",
  "docs/current/STEP202_1B_SOUNDALERTS_LONGER_LOG.md",
  "docs/current/STEP202_3_ALERTS_URGENT_NEXT_WORK.md",
  "docs/current/STEP202_ALERT_HISTORY_PROVIDER_DIAG_README.md",
  "docs/current/STEP202_TIPEEE_TWITCH_TIMING_CHECK_FIX.md",
  "docs/current/STEP202_TIPEEE_TWITCH_TIMING_SQLITE_CORE.md",
  "docs/current/STEP203_ALERT_PROVIDER_SAFETY_FIX.md",
  "docs/current/STEP204_1_TWITCH_SUB_GIFT_RULE_CLEANUP.md",
  "docs/current/STEP204_TWITCH_SUB_GIFT_RULE_MODEL.md",
  "docs/current/STEP205_ALERT_RULE_VALUE_HINTS.md",
  "docs/current/STEP206_ALERT_TTS_DISPATCH.md",
  "docs/current/STEP207_1_ALERT_TTS_VERIFIED_2026-05-09.md",
  "docs/current/STEP207_ALERT_RULE_TTS_DASHBOARD_SETTINGS.md",
  "docs/current/STEP208_ALERT_OVERLAY_USERNAME_LAYOUT_VERIFIED_2026-05-09.md",
  "docs/current/STEP209_ALERT_MESSAGE_TEXT_SETTINGS_2026-05-09.md",
  "docs/current/STEP240_MESSAGE_ROTATOR_BACKEND_SCHEDULER.md",
  "docs/current/STEP432_TO_STEP433_HANDOFF.md"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$quarantineRoot = Join-Path $ProjectRoot ("_cleanup_quarantine\STEP534_CURRENT_STEP_DOCS_" + $timestamp)
$reportLines = @()

$reportLines += "STEP534 Current STEP Docs Quarantine"
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
  $reportPath = Join-Path $quarantineRoot "STEP534_QUARANTINE_REPORT.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP534 Quarantine fertig."
  Write-Host ("Report: " + $reportPath)
} else {
  $outDir = Join-Path $ProjectRoot "system-scan-output"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $reportPath = Join-Path $outDir "step534_current_step_docs_dryrun.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP534 Dry-Run fertig."
  Write-Host ("Report: " + $reportPath)
}
