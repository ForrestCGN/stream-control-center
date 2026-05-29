param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

$targets = @(
  "docs/backend/ALERT_RULE_IMAGE_MEDIAID_STEP276H.md",
  "docs/backend/ALERT_RULE_MEDIA_DURATION_STEP276F.md",
  "docs/backend/ALERT_SOUNDBUS_CORRELATION_STEP340.md",
  "docs/backend/ALERT_SYSTEM_MEDIA_RULE_COLUMNS_STEP276B.md",
  "docs/backend/ALERT_SYSTEM_MEDIA_RULE_COLUMNS_STEP276B_FIX1.md",
  "docs/backend/ALERT_SYSTEM_MEDIAID_PLAYBACK_STEP276C.md",
  "docs/backend/ALERT_SYSTEM_MEDIAID_PLAYBACK_STEP276C_FIX1.md",
  "docs/backend/ALERT_SYSTEM_MEDIAID_REFACTOR_PLAN_STEP276.md",
  "docs/backend/ALERT_SYSTEM_MEDIAID_STEP276_SUMMARY.md",
  "docs/dashboard/ALERT_DASHBOARD_BUS_CORRELATION_STEP350.md",
  "docs/dashboard/ALERT_DASHBOARD_MEDIAID_STEP276_SUMMARY.md",
  "docs/dashboard/ALERT_DISPLAY_GRAPHIC_MEDIAPICKER_LAYOUT_STEP276G_FIX1.md",
  "docs/dashboard/ALERT_DISPLAY_GRAPHIC_MEDIAPICKER_STEP276G.md",
  "docs/dashboard/ALERT_GRAPHIC_FALLBACK_CARD_STYLE_STEP276H_FIX3.md",
  "docs/dashboard/ALERT_IMAGE_FALLBACK_DUPLICATE_LABEL_STEP276H_FIX2.md",
  "docs/dashboard/ALERT_LEGACY_SOUND_FOLDOUT_LAYOUT_FIX_STEP276E_FIX1.md",
  "docs/dashboard/ALERT_LEGACY_SOUND_FOLDOUT_STEP276E.md",
  "docs/dashboard/ALERT_LEGACY_SOUND_NO_LAYOUT_SHIFT_STEP276E_FIX2.md",
  "docs/dashboard/ALERT_RULE_IMAGE_FALLBACK_TEXT_CLEANUP_STEP276H_FIX1.md",
  "docs/dashboard/ALERT_RULE_IMAGE_MEDIAPICKER_STEP276H.md",
  "docs/dashboard/ALERT_RULE_MEDIA_DURATION_STEP276F.md",
  "docs/dashboard/ALERT_RULE_MEDIAPICKER_SOUND_LAYOUT_FIX_STEP276D_FIX1.md",
  "docs/dashboard/ALERT_RULE_MEDIAPICKER_SOUND_STEP276D.md",
  "docs/dashboard/ALERT_SOUNDBUS_HANDOFF_STEP351.md",
  "docs/overlays/STEP393_ALERT_OVERLAY_DIRECT_RECONNECT.md",
  "docs/README_STEP278H_I_MASTER_OVERLAY_ALERT_MIRROR.md",
  "docs/sound_system/STABLE_sound_system_alert_handoff_runtime_dashboard_2026-05-02.md"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$quarantineRoot = Join-Path $ProjectRoot ("_cleanup_quarantine\STEP536A_ALERT_TECH_DOCS_" + $timestamp)
$reportLines = @()

$reportLines += "STEP536A Alert Tech Docs Quarantine"
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
  $reportPath = Join-Path $quarantineRoot "STEP536A_QUARANTINE_REPORT.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536A Quarantine fertig."
  Write-Host ("Report: " + $reportPath)
} else {
  $outDir = Join-Path $ProjectRoot "system-scan-output"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $reportPath = Join-Path $outDir "step536a_alert_tech_docs_dryrun.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536A Dry-Run fertig."
  Write-Host ("Report: " + $reportPath)
}
