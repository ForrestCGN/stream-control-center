param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

$targets = @(
  "docs/README_STEP193_1_CLIP_DISABLE_LIVE_GUARD.txt",
  "docs/README_STEP193_1_CLIP_DISABLE_LIVE_GUARD_FULLFILE.txt",
  "docs/README_STEP193_2_CLIP_REPLAY_FILE_SELECTION_FIX.txt",
  "docs/README_STEP193_3_CLIP_REPLAY_PREFIX_FIX.txt",
  "docs/README_STEP194_CLIP_BACKEND_CHAT_HELPER.txt",
  "docs/README_STEP195_CLIP_TWITCH_TITLE_DURATION_FULLFILE.txt",
  "docs/README_STEP196_DOCUMENTATION.txt",
  "docs/README_STEP203_8.md",
  "docs/README_STEP278B_COMMUNICATION_HELPER_CORE.md",
  "docs/STEP203_7_TWITCH_EVENTSUB_LOYALTY_BRIDGE.md",
  "docs/overlays/STEP392_DIRECT_OVERLAY_PRODUCTION_RULE.md",
  "docs/overlays/STEP393A_DIAGNOSTIC_ONLY.md",
  "docs/dashboard/MEDIA_PICKER_UPLOAD_FIELD_ORDER_STEP275B_FIX1.md"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$quarantineRoot = Join-Path $ProjectRoot ("_cleanup_quarantine\STEP536D_README_CLIP_MISC_TECH_DOCS_" + $timestamp)
$reportLines = @()

$reportLines += "STEP536D README/Clip/Misc Tech Docs Quarantine"
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
  $reportPath = Join-Path $quarantineRoot "STEP536D_QUARANTINE_REPORT.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536D Quarantine fertig."
  Write-Host ("Report: " + $reportPath)
} else {
  $outDir = Join-Path $ProjectRoot "system-scan-output"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $reportPath = Join-Path $outDir "step536d_readme_clip_misc_tech_docs_dryrun.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536D Dry-Run fertig."
  Write-Host ("Report: " + $reportPath)
}
