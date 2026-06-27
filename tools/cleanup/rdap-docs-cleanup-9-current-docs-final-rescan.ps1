param(
    [switch]$Execute,
    [switch]$WriteReports
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$ReportDir = Join-Path $RepoRoot '_handoff\rdap-docs-cleanup-9-current-docs-final-rescan'

$Moves = @(
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_5_CANDIDATE_SUMMARY.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_5_CANDIDATE_SUMMARY.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_5_CURRENT_ARCHIVE_MANIFEST.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_5_CURRENT_ARCHIVE_MANIFEST.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_6_CANDIDATE_SUMMARY.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_6_CANDIDATE_SUMMARY.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_6_SECOND_PASS_AUDIT.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_6_SECOND_PASS_AUDIT.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_7_ARCHIVE_OR_MERGE_MANIFEST.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_7_CANDIDATE_SUMMARY.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_7_CANDIDATE_SUMMARY.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_8_CANDIDATE_SUMMARY.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_8_CANDIDATE_SUMMARY.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CLEANUP_8_REVIEW_MANUALLY_AUDIT.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CLEANUP_8_REVIEW_MANUALLY_AUDIT.md' }
    [pscustomobject]@{ Source = 'docs/current/DOCS_CURRENT_CONSOLIDATION_AUDIT.md'; Target = 'docs/archive/docs-current-cleanup-9/DOCS_CURRENT_CONSOLIDATION_AUDIT.md' }
    [pscustomobject]@{ Source = 'docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_6.md'; Target = 'docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_6.md' }
    [pscustomobject]@{ Source = 'docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_7.md'; Target = 'docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_7.md' }
    [pscustomobject]@{ Source = 'docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_8.md'; Target = 'docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_8.md' }
    [pscustomobject]@{ Source = 'docs/current/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_9.md'; Target = 'docs/archive/docs-current-cleanup-9/NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP_9.md' }
)

$missingSources = @()
$existingTargets = @()

foreach ($move in $Moves) {
    $sourcePath = Join-Path $RepoRoot $move.Source
    $targetPath = Join-Path $RepoRoot $move.Target
    if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
        $missingSources += $move.Source
    }
    if (Test-Path -LiteralPath $targetPath) {
        $existingTargets += $move.Target
    }
}

Write-Host ('Archive candidates: ' + $Moves.Count)
Write-Host ('Missing sources: ' + $missingSources.Count)
Write-Host ('Existing targets: ' + $existingTargets.Count)
Write-Host ('Mode: ' + $(if ($Execute) { 'EXECUTE' } else { 'DRY-RUN' }))

if ($missingSources.Count -gt 0) {
    Write-Host 'Missing source files:'
    $missingSources | ForEach-Object { Write-Host ('- ' + $_) }
}

if ($existingTargets.Count -gt 0) {
    Write-Host 'Existing target paths:'
    $existingTargets | ForEach-Object { Write-Host ('- ' + $_) }
}

if ($WriteReports) {
    New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null
    $Moves | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $ReportDir 'move-plan.json') -Encoding UTF8
    $tsv = @('Source`tTarget')
    foreach ($move in $Moves) {
        $tsv += ($move.Source + "`t" + $move.Target)
    }
    $tsv | Set-Content -LiteralPath (Join-Path $ReportDir 'move-plan.tsv') -Encoding UTF8
    Write-Host ('Reports written: ' + $ReportDir)
}

if (-not $Execute) {
    Write-Host 'Dry-run only. Re-run with -Execute to move files.'
    exit 0
}

if ($missingSources.Count -gt 0 -or $existingTargets.Count -gt 0) {
    throw 'Execute aborted because sources are missing or targets already exist.'
}

foreach ($move in $Moves) {
    $sourcePath = Join-Path $RepoRoot $move.Source
    $targetPath = Join-Path $RepoRoot $move.Target
    $targetDir = Split-Path -Parent $targetPath
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Move-Item -LiteralPath $sourcePath -Destination $targetPath
    Write-Host ('Moved: ' + $move.Source + ' -> ' + $move.Target)
}

Write-Host 'Cleanup 9 archive move completed.'
