<#
.SYNOPSIS
  RDAP Docs Cleanup 6 second-pass scanner.

.DESCRIPTION
  Doku-only helper. Default is Dry-Run. It classifies files under docs/current and restores
  the RDAP workflow file from docs/archive/docs-current-cleanup-5 when -Execute is used.

  It does not delete files. It does not move the remaining ARCHIVE_OR_MERGE candidates.
  Optional -WriteReports writes local scan logs to _handoff/rdap-docs-cleanup-6-second-pass.
  Those logs are intentionally local review material and should be deleted or explicitly
  committed after review; do not leave them as untracked repo noise.
#>

param(
  [switch]$Execute,
  [switch]$WriteReports
)

$ErrorActionPreference = 'Stop'

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptPath '..\..')
$docsCurrent = Join-Path $repoRoot 'docs\current'
$cleanup5Archive = Join-Path $repoRoot 'docs\archive\docs-current-cleanup-5'
$handoffDir = Join-Path $repoRoot '_handoff\rdap-docs-cleanup-6-second-pass'

$workflowFile = 'RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md'
$workflowCurrent = Join-Path $docsCurrent $workflowFile
$workflowArchive = Join-Path $cleanup5Archive $workflowFile

if (!(Test-Path $docsCurrent)) {
  throw "docs/current not found: $docsCurrent"
}

$keepCurrent = @(
  'START_HERE_FOR_NEW_CHAT.md',
  'MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt',
  $workflowFile,
  'PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md',
  'REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md',
  'REMOTE_MODBOARD_ROADMAP_CURRENT.md',
  'MODULE_DOCS_CONSOLIDATED_CURRENT.md',
  'ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md',
  'DOCS_CURRENT_CONSOLIDATION_AUDIT.md',
  'DOCS_CLEANUP_5_CURRENT_ARCHIVE_MANIFEST.md',
  'DOCS_CLEANUP_5_CANDIDATE_SUMMARY.md',
  'NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_6.md',
  'DOCS_CLEANUP_6_SECOND_PASS_AUDIT.md',
  'DOCS_CLEANUP_6_CANDIDATE_SUMMARY.md',
  'NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_7.md'
)

$archiveOrMergePatterns = @(
  '^CURRENT_CHAT_HANDOFF',
  '^CAN[-_0-9A-Z]',
  '^NEXT_CHAT_PROMPT',
  '^PROMPT',
  '^DOCS_CLEANUP_[234]_',
  '^DOCS_CLEANUP_2_',
  '^README',
  '^STEP',
  'DIAGNOSTIC',
  'DIAGNOSTICS',
  '^DIAG',
  '^ADMIN_DIAGNOSTICS',
  '^MODULE_DIAGNOSTICS',
  '^ROUTE_DIAGNOSTICS',
  '^PROJECT_.*(2026-05|CLEANUP|HANDOFF|MODULE_AND_ROUTE_MAP|DOCUMENTATION_MAP|DASHBOARD_MAP|CONFIG_DATABASE_MAP|BACKEND_MODULE_STATUS|ACTIVE_SYSTEM_OVERVIEW)',
  '^REMOTE_DASHBOARD_',
  '^START_HERE_RDAP',
  '^MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM',
  '^BUS_TWITCH_',
  '^OVERLAY_',
  '^SHOUTOUT_',
  '^LWG',
  '^HT[23]_',
  '^EVS',
  '^LC',
  '^TODO_',
  '^CHANGELOG_',
  '^FILES_',
  '^TEST_',
  '^TOOLS1_',
  '^WF1_',
  '^HOTFIX',
  '^EMERGENCY',
  '^DEATHCOUNTER',
  '^BIRTHDAY_',
  '^VIP_',
  '^STATS_',
  '^ForrestCGN',
  '^HANDOFF',
  '^NEW_',
  '^SERVER_',
  '^DOC_'
)

function Get-Cleanup6Category {
  param([string]$Name)

  if ($keepCurrent -contains $Name) {
    return 'KEEP_CURRENT'
  }

  if (@('CHANGELOG.md', 'TODO.md', 'FILES.md') -contains $Name) {
    return 'ARCHIVE_OR_MERGE'
  }

  foreach ($pattern in $archiveOrMergePatterns) {
    if ($Name -match $pattern) {
      return 'ARCHIVE_OR_MERGE'
    }
  }

  return 'REVIEW_MANUALLY'
}

$files = Get-ChildItem -Path $docsCurrent -File | Sort-Object Name
$names = New-Object System.Collections.Generic.List[string]
foreach ($file in $files) { [void]$names.Add($file.Name) }
if (!($names -contains $workflowFile)) { [void]$names.Add($workflowFile) }

$rows = foreach ($name in ($names | Sort-Object -Unique)) {
  [PSCustomObject]@{
    Path = "docs/current/$name"
    Category = Get-Cleanup6Category -Name $name
  }
}

$grouped = $rows | Group-Object Category | Sort-Object Name

Write-Host "RDAP Docs Cleanup 6 Second Pass"
$mode = if ($Execute) { 'EXECUTE' } else { 'DRY-RUN' }
Write-Host "Mode: $mode"
Write-Host "Repo: $repoRoot"
Write-Host ""
Write-Host "Classification counts:"
foreach ($group in $grouped) {
  Write-Host ("- {0}: {1}" -f $group.Name, $group.Count)
}

Write-Host ""
if (Test-Path $workflowCurrent) {
  Write-Host "Workflow file already present: docs/current/$workflowFile"
} else {
  Write-Host "Workflow file missing in docs/current: docs/current/$workflowFile"
  if (!(Test-Path $workflowArchive)) {
    throw "Cannot restore because archive source is missing: $workflowArchive"
  }

  if ($Execute) {
    Copy-Item -Path $workflowArchive -Destination $workflowCurrent -Force
    Write-Host "Restored from: docs/archive/docs-current-cleanup-5/$workflowFile"
  } else {
    Write-Host "Dry-Run: would restore from docs/archive/docs-current-cleanup-5/$workflowFile"
  }
}

if ($WriteReports) {
  New-Item -Path $handoffDir -ItemType Directory -Force | Out-Null
  $rows | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $handoffDir 'classification.json') -Encoding UTF8
  $rows | Sort-Object Category, Path | ForEach-Object { "$($_.Category)`t$($_.Path)" } | Set-Content -Path (Join-Path $handoffDir 'classification.tsv') -Encoding UTF8
  Write-Host ""
  Write-Host "Reports written to: _handoff/rdap-docs-cleanup-6-second-pass/"
  Write-Host "Do not leave these reports as untracked repo noise. Delete them after review or commit intentionally."
}

Write-Host ""
Write-Host "No deletes performed. No archive moves performed. REVIEW_MANUALLY remains untouched."
