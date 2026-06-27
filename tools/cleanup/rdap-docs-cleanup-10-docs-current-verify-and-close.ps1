param(
    [switch]$Execute,
    [switch]$WriteReports
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ReportDir = Join-Path $RepoRoot '_handoffdap-docs-cleanup-10-docs-current-verify-and-close'

$ArchiveMoves = @(
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN_AUDIT.md'; Target = 'docs/archive/docs-current-cleanup-10/DOCS_CLEANUP_9_CURRENT_DOCS_FINAL_RESCAN_AUDIT.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_9_CANDIDATE_SUMMARY.md'; Target = 'docs/archive/docs-current-cleanup-10/DOCS_CLEANUP_9_CANDIDATE_SUMMARY.md' }
    [pscustomobject]@{ Source = 'docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_10.md'; Target = 'docs/archive/docs-current-cleanup-10/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_10.md' }
)

$ExpectedFinalCurrentFiles = @(
    'docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md'
    'docs/current/CURRENT_DASHBOARD_STATE.md'
    'docs/current/CURRENT_REMOTE_MODBOARD_STATE.md'
    'docs/current/CURRENT_STREAM_PC_AGENT_STATE.md'
    'docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md'
    'docs/current/DOCS_STRUCTURE_AND_ARCHIVE_RULES.md'
    'docs/current/EVENT_BUS_DASHBOARD_AND_CONFIG.md'
    'docs/current/EVENT_BUS_OVERLAY_CLIENTS_STATUS.md'
    'docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt'
    'docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md'
    'docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md'
    'docs/current/PROJECT_WORKING_RULES.md'
    'docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md'
    'docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md'
    'docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md'
    'docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md'
    'docs/current/START_HERE_FOR_NEW_CHAT.md'
    'docs/current/DOCS_CLEANUP_10_DOCS_CURRENT_VERIFY_AND_CLOSE.md'
    'docs/current/DOCS_CURRENT_FINAL_INDEX.md'
    'docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md'
)

$currentFilesBefore = Get-ChildItem -LiteralPath (Join-Path $RepoRoot 'docs\current') -File | ForEach-Object {
    'docs/current/' + $_.Name
} | Sort-Object

$missingSources = @()
$existingTargets = @()
foreach ($move in $ArchiveMoves) {
    $sourcePath = Join-Path $RepoRoot $move.Source
    $targetPath = Join-Path $RepoRoot $move.Target
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { $missingSources += $move.Source }
    if (Test-Path -LiteralPath $targetPath) { $existingTargets += $move.Target }
}

$plannedFinal = @($currentFilesBefore | Where-Object { $ArchiveMoves.Source -notcontains $_ }) | Sort-Object
$expectedSorted = @($ExpectedFinalCurrentFiles | Sort-Object)
$missingExpected = @($expectedSorted | Where-Object { $plannedFinal -notcontains $_ })
$unexpectedFinal = @($plannedFinal | Where-Object { $expectedSorted -notcontains $_ })

Write-Host ('Current docs before archive: ' + $currentFilesBefore.Count)
Write-Host ('Archive candidates: ' + $ArchiveMoves.Count)
Write-Host ('Expected final current files: ' + $ExpectedFinalCurrentFiles.Count)
Write-Host ('Planned final current files: ' + $plannedFinal.Count)
Write-Host ('Missing sources: ' + $missingSources.Count)
Write-Host ('Existing targets: ' + $existingTargets.Count)
Write-Host ('Missing expected final files: ' + $missingExpected.Count)
Write-Host ('Unexpected final current files: ' + $unexpectedFinal.Count)
Write-Host ('Mode: ' + $(if ($Execute) { 'EXECUTE' } else { 'DRY-RUN' }))

if ($missingSources.Count -gt 0) {
    Write-Host 'Missing source files:'
    $missingSources | ForEach-Object { Write-Host ('- ' + $_) }
}
if ($existingTargets.Count -gt 0) {
    Write-Host 'Existing target paths:'
    $existingTargets | ForEach-Object { Write-Host ('- ' + $_) }
}
if ($missingExpected.Count -gt 0) {
    Write-Host 'Missing expected final files:'
    $missingExpected | ForEach-Object { Write-Host ('- ' + $_) }
}
if ($unexpectedFinal.Count -gt 0) {
    Write-Host 'Unexpected final current files:'
    $unexpectedFinal | ForEach-Object { Write-Host ('- ' + $_) }
}

if ($WriteReports) {
    New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
    $report = [pscustomobject]@{
        currentDocsBefore = $currentFilesBefore
        archiveMoves = $ArchiveMoves
        expectedFinalCurrentFiles = $ExpectedFinalCurrentFiles
        plannedFinalCurrentFiles = $plannedFinal
        missingSources = $missingSources
        existingTargets = $existingTargets
        missingExpectedFinalFiles = $missingExpected
        unexpectedFinalCurrentFiles = $unexpectedFinal
    }
    $report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $ReportDir 'verify-and-close.json') -Encoding UTF8
    $plannedFinal | Set-Content -LiteralPath (Join-Path $ReportDir 'final-current-files.txt') -Encoding UTF8
    Write-Host ('Reports written: ' + $ReportDir)
}

if (-not $Execute) {
    Write-Host 'Dry-run only. Re-run with -Execute to archive Cleanup 9 files and verify final docs/current.'
    exit 0
}

if ($missingSources.Count -gt 0 -or $existingTargets.Count -gt 0 -or $missingExpected.Count -gt 0 -or $unexpectedFinal.Count -gt 0) {
    throw 'Execute aborted because the planned final docs/current state is not clean.'
}

foreach ($move in $ArchiveMoves) {
    $sourcePath = Join-Path $RepoRoot $move.Source
    $targetPath = Join-Path $RepoRoot $move.Target
    $targetDir = Split-Path -Parent $targetPath
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Move-Item -LiteralPath $sourcePath -Destination $targetPath
    Write-Host ('Moved: ' + $move.Source + ' -> ' + $move.Target)
}

$finalFiles = Get-ChildItem -LiteralPath (Join-Path $RepoRoot 'docs\current') -File | ForEach-Object {
    'docs/current/' + $_.Name
} | Sort-Object
$finalMissing = @($expectedSorted | Where-Object { $finalFiles -notcontains $_ })
$finalUnexpected = @($finalFiles | Where-Object { $expectedSorted -notcontains $_ })

Write-Host ('Final current docs count: ' + $finalFiles.Count)
Write-Host ('Final missing expected files: ' + $finalMissing.Count)
Write-Host ('Final unexpected files: ' + $finalUnexpected.Count)

if ($finalMissing.Count -gt 0 -or $finalUnexpected.Count -gt 0) {
    throw 'Cleanup 10 verification failed after archive move.'
}

Write-Host 'Cleanup 10 verify-and-close completed.'
