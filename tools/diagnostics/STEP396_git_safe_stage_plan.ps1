param(
  [string]$RepoPath = "D:\Git\stream-control-center"
)

function Log([string]$msg) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  Write-Host "$ts $msg"
}

function RunGit([string[]]$Args) {
  & git @Args
}

Set-Location $RepoPath
Log "STEP396 safe git stage plan started"
Log "RepoPath=$RepoPath"

$branch = (git branch --show-current).Trim()
Log "Git branch=$branch"

$status = git status --short
Log "Raw git status follows:"
$status | ForEach-Object { Write-Host $_ }

Write-Host ""
Log "Risk scan:"
$riskyPatterns = @(
  '_trace/',
  '.bak',
  '.sqlite',
  '.db',
  '.zip',
  '.7z',
  'token',
  'secret',
  'STEP386',
  '_overlay-alerts-v2-bus.html'
)
foreach ($p in $riskyPatterns) {
  $hits = @($status | Where-Object { $_ -match [regex]::Escape($p) })
  if ($hits.Count -gt 0) {
    Log "RISK pattern '$p' hits=$($hits.Count)"
    $hits | ForEach-Object { Write-Host "  $_" }
  }
}

Write-Host ""
Log "Recommended: DO NOT run broad git add backend config htdocs project-state docs tools"
Log "Recommended safe staging for documentation/check scripts only:"

$recommended = @(
  'project-state/STEP392_DIRECT_OVERLAY_REAL_FLOW_STABLE_HANDOFF.md',
  'project-state/STEP393_DIRECT_OVERLAY_RECONNECT_STABLE.md',
  'project-state/STEP393A_DIRECT_OVERLAY_RECONNECT_STABLE_PS51_FIX.md',
  'project-state/STEP394_DIRECT_OVERLAY_FINAL_STABLE_HANDOFF.md',
  'project-state/STEP395_ALERT_DIRECT_OVERLAY_GIT_COMMIT_PREP.md',
  'project-state/STEP396_SAFE_GIT_COMMIT_PLAN.md',
  'docs/current/CURRENT_SYSTEM_STATUS_STEP392_APPEND.md',
  'docs/current/CURRENT_SYSTEM_STATUS_STEP393_APPEND.md',
  'docs/current/CURRENT_SYSTEM_STATUS_STEP393A_APPEND.md',
  'docs/current/CURRENT_SYSTEM_STATUS_STEP394_APPEND.md',
  'docs/current/CURRENT_SYSTEM_STATUS_STEP395_APPEND.md',
  'docs/current/CURRENT_SYSTEM_STATUS_STEP396_APPEND.md',
  'docs/overlays/STEP392_DIRECT_OVERLAY_PRODUCTION_RULE.md',
  'docs/overlays/STEP393_ALERT_OVERLAY_DIRECT_RECONNECT.md',
  'docs/overlays/STEP393A_DIAGNOSTIC_ONLY.md',
  'tools/diagnostics/STEP392_quick_status_check.ps1',
  'tools/diagnostics/STEP393A_quick_status_check_ps51.ps1',
  'tools/diagnostics/STEP394_final_stable_status_check.ps1',
  'tools/diagnostics/STEP395_git_commit_prep_check.ps1',
  'tools/diagnostics/STEP396_git_safe_stage_plan.ps1'
)

foreach ($f in $recommended) {
  if (Test-Path $f) {
    Write-Host "git add -- `"$f`""
  } else {
    Write-Host "# missing locally, skip: $f"
  }
}

Write-Host ""
Log "Suggested commit after manual review:"
Write-Host 'git commit -m "STEP396: document stable direct alert overlay flow"'
Write-Host 'git push origin dev'
Write-Host ""
Write-Host "STEP396_STATUS=PLAN_READY"
