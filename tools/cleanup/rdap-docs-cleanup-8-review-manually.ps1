param(
  [switch]$Execute,
  [switch]$WriteReports
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$archiveRoot = 'docs/archive/docs-current-cleanup-8'

$manifestText = @'
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS42_1_NEXT.md
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS43_NEXT.md
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS44_NEXT.md
docs/current/CURRENT_CHAT_PROMPT_EVENT_SYSTEM_EVS49_12_NEXT.md
docs/current/CURRENT_STATUS.md
docs/current/CURRENT_STATUS_EVENT_SOUND_RUNTIME_2026-06-16.md
docs/current/CURRENT_STATUS_EVS52_21_WINNER_FINALE_STABLE.md
docs/current/CURRENT_STATUS_VIP30_STEP8_19_23.md
docs/current/CURRENT_STEP_HISTORY_CONSOLIDATED.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/DASHBOARD_NAVIGATION_STICKY_MAIN_AND_MODULE_CAN44_21_0_5.md
docs/current/DASHBOARD_V2_BUILD_LOCAL_DELIVERY.md
docs/current/DASHBOARD_V2_DESIGN_FRONTEND_PLAN.md
docs/current/DASHBOARD_V2_DESIGN_REFERENCE_V13.md
docs/current/DASHBOARD_V2_FRONTEND_TECH_DECISION.md
docs/current/DASHBOARD_V2_PARALLEL_MIGRATION_PLAN.md
docs/current/DASHBOARD_V2_REACT_V13_ALIGNMENT.md
docs/current/DASHBOARD_V2_REACT_VITE_PROTOTYPE.md
docs/current/DASHBOARD_V2_STATIC_ROUTE.md
docs/current/DOCS_AND_STATS_CLEANUP_AUDIT.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-27.md
docs/current/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md
docs/current/MODULE_INVENTORY_CURRENT.md
docs/current/MODULE_STATUS.md
docs/current/NEXT_CHAT_HANDOFF_SHOUTOUT_SYSTEM_CAN44.md
docs/current/NEXT_STEPS.md
docs/current/NEXT_STEPS_EVENT_SOUND_RUNTIME.md
docs/current/NEXT_STEPS_SATZ_SYSTEM_EVS49_38.md
docs/current/NEXT_TODO_STEP279.md
docs/current/ROUTE_SERVICE_INVENTORY_CURRENT.md
'@

$items = @()
foreach ($line in ($manifestText -split "`n")) {
  $src = $line.Trim()
  if ([string]::IsNullOrWhiteSpace($src)) { continue }
  $dst = $src -replace '^docs/current/', ($archiveRoot + '/')
  $items += [pscustomobject]@{ Source = $src; Target = $dst }
}

$missingSources = @()
$existingTargets = @()
foreach ($item in $items) {
  $sourcePath = Join-Path $repoRoot $item.Source
  $targetPath = Join-Path $repoRoot $item.Target
  if (-not (Test-Path -LiteralPath $sourcePath)) { $missingSources += $item.Source }
  if (Test-Path -LiteralPath $targetPath) { $existingTargets += $item.Target }
}

Write-Host "RDAP Docs Cleanup 8 - Review Manually Pass"
Write-Host "Repo root: $repoRoot"
Write-Host "Mode: $(if ($Execute) { 'EXECUTE' } else { 'DRY-RUN' })"
Write-Host "Reviewed files total: 40"
Write-Host "Keep current: 9"
Write-Host "Archive candidates: $($items.Count)"
Write-Host "Missing sources: $($missingSources.Count)"
Write-Host "Existing targets: $($existingTargets.Count)"
Write-Host "Archive root: $archiveRoot"

if ($WriteReports) {
  $reportDir = Join-Path $repoRoot '_handoff\rdap-docs-cleanup-8-review-manually'
  New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
  $jsonPath = Join-Path $reportDir 'review-archive-plan.json'
  $tsvPath = Join-Path $reportDir 'review-archive-plan.tsv'
  $items | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $jsonPath -Encoding UTF8
  $items | ForEach-Object { "$($_.Source)`t$($_.Target)" } | Set-Content -LiteralPath $tsvPath -Encoding UTF8
  Write-Host "Reports written:"
  Write-Host "- $jsonPath"
  Write-Host "- $tsvPath"
}

if (-not $Execute) {
  Write-Host "Dry-run only. No files moved. Use -Execute after reviewing the counts."
  exit 0
}

if ($missingSources.Count -gt 0) {
  Write-Error ("Execute aborted: missing source files detected. First missing: " + $missingSources[0])
}
if ($existingTargets.Count -gt 0) {
  Write-Error ("Execute aborted: target files already exist. First existing: " + $existingTargets[0])
}

foreach ($item in $items) {
  $sourcePath = Join-Path $repoRoot $item.Source
  $targetPath = Join-Path $repoRoot $item.Target
  $targetDir = Split-Path -Parent $targetPath
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  Move-Item -LiteralPath $sourcePath -Destination $targetPath
}

Write-Host "Execute complete. Moved $($items.Count) files to $archiveRoot."
Write-Host "Run git status and review the archive move before stepdone.cmd."
