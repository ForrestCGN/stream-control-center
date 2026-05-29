param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [switch]$Apply
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

$targets = @(
  "docs/vip/STEP398_VIP_CURRENT_FLOW_AND_EVENT_BUS_TARGET.md",
  "docs/vip/STEP399_VIP_OVERLAY_BUS_SHADOW_REGISTRATION.md",
  "docs/vip/STEP400_VIP_BUS_SHADOW_STABLE.md",
  "docs/vip/STEP401_VIP_OVERLAY_EVENT_SHADOW_TEST.md",
  "docs/vip/STEP402_VIP_EVENT_SHADOW_STABLE.md",
  "docs/vip/STEP403_VIP_OVERLAY_PREVIEW_SHOW_HIDE.md",
  "docs/vip/STEP403A_VIP_OVERLAY_PREVIEW_VISIBLE_WAIT_TEST.md",
  "docs/vip/STEP404_VIP_PREVIEW_SHOW_HIDE_STABLE.md",
  "docs/vip/STEP404A_VIP_PREVIEW_STABLE_CHECK_PS51_FIX.md",
  "docs/vip/STEP404B_VIP_PREVIEW_STABLE_CHECK_NO_EVENT_ROUTE.md",
  "docs/vip/STEP404C_VIP_PREVIEW_STABLE_CHECK_RESULT_WRAPPER_FIX.md"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$quarantineRoot = Join-Path $ProjectRoot ("_cleanup_quarantine\STEP536C_VIP_TECH_DOCS_" + $timestamp)
$reportLines = @()

$reportLines += "STEP536C VIP Tech Docs Quarantine"
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
  $reportPath = Join-Path $quarantineRoot "STEP536C_QUARANTINE_REPORT.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536C Quarantine fertig."
  Write-Host ("Report: " + $reportPath)
} else {
  $outDir = Join-Path $ProjectRoot "system-scan-output"
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
  $reportPath = Join-Path $outDir "step536c_vip_tech_docs_dryrun.txt"
  $reportLines | Out-File $reportPath -Encoding utf8
  Write-Host ""
  Write-Host "STEP536C Dry-Run fertig."
  Write-Host ("Report: " + $reportPath)
}
