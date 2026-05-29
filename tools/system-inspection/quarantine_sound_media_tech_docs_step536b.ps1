param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

$targets = @(
  "docs/backend/BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY_STEP275B.md",
  "docs/backend/DISCORD_MEDIA_PATH_AUDIT_STEP292.md",
  "docs/backend/DISCORD_MEDIA_PATH_RESOLVER_FIX_STEP293.md",
  "docs/backend/DISCORD_MEDIA_PATH_RESOLVER_RETEST_STEP294.md",
  "docs/backend/MEDIA_REGISTRY_SOUND_BIRTHDAY_MEDIAID_STEP275.md",
  "docs/backend/SOUND_SYSTEM_BUS_AUDIT_STEP288.md",
  "docs/backend/SOUND_SYSTEM_MEDIAID_DIRECT_STEP275A.md",
  "docs/backend/SOUNDBUS_BASE_TESTS_STEP290.md",
  "docs/backend/SOUNDBUS_CONSUMER_DASHBOARD_PLAN_STEP298.md",
  "docs/backend/SOUNDBUS_CONSUMER_INTEGRATION_STEP310.md",
  "docs/backend/SOUNDBUS_DEBUG_VIEW_STEP296.md",
  "docs/backend/SOUNDBUS_DEBUG_VIEW_TEST_STEP297.md",
  "docs/backend/SOUNDBUS_OPERATION_DECISION_STEP295.md",
  "docs/backend/SOUNDBUS_V5_REGRESSION_STEP291.md",
  "docs/dashboard/SOUND_DASHBOARD_BACKEND_AUTH_VALIDATION_STEP301.md",
  "docs/dashboard/SOUND_DASHBOARD_BUS_CONSUMER_CONTEXT_STEP310.md",
  "docs/dashboard/SOUND_DASHBOARD_BUSMONITOR_AUTO_REFRESH_STEP303.md",
  "docs/dashboard/SOUND_DASHBOARD_CONTROL_CENTER_STEP320.md",
  "docs/dashboard/SOUND_DASHBOARD_MONITORING_STEP299.md",
  "docs/dashboard/SOUND_DASHBOARD_MONITORING_TEST_STEP300.md",
  "docs/dashboard/SOUND_DASHBOARD_READONLY_REFRESH_FIX_STEP302.md",
  "docs/dashboard/SOUND_DASHBOARD_UI_CONTROL_STABILIZATION_STEP330.md",
  "docs/media/MEDIA_SYSTEM_ARCHITECTURE_STEP274K.md"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$quarantineRoot = Join-Path $ProjectRoot ("_cleanup_quarantine\STEP536B_SOUND_MEDIA_TECH_DOCS_" + $timestamp)
$reportLines = @()

$reportLines += "STEP536B Sound/Media Tech Docs Quarantine"
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
  $reportPath = Join-Path $quarantineRoot "STEP536B_QUARANTINE_REPORT.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536B Quarantine fertig."
  Write-Host ("Report: " + $reportPath)
} else {
  $outDir = Join-Path $ProjectRoot "system-scan-output"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $reportPath = Join-Path $outDir "step536b_sound_media_tech_docs_dryrun.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536B Dry-Run fertig."
  Write-Host ("Report: " + $reportPath)
}
