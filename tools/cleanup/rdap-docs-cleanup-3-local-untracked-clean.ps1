param(
    [switch]$Execute
)

$ErrorActionPreference = 'Stop'

$Step = 'RDAP_DOCS_CLEANUP_3_LOCAL_UNTRACKED_CLEAN'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Mode = if ($Execute) { 'EXECUTE' } else { 'DRY-RUN' }

$Candidates = @(
    'README_RDAP39B_INSTALL.txt',
    'edf e',
    '_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_dry-run_20260627_134334.json',
    '_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_dry-run_20260627_134334.txt',
    '_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_execute_20260627_134404.json',
    '_handoff/RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE/cleanup2_execute_20260627_134404.txt'
)

$HandoffDir = Join-Path $RepoRoot ('_handoff\' + $Step)
New-Item -ItemType Directory -Path $HandoffDir -Force | Out-Null
$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$LogJson = Join-Path $HandoffDir ("cleanup3_{0}_{1}.json" -f ($Mode.ToLower()), $Stamp)
$LogText = Join-Path $HandoffDir ("cleanup3_{0}_{1}.txt" -f ($Mode.ToLower()), $Stamp)

$Results = @()
foreach ($rel in $Candidates) {
    $normalized = $rel -replace '/', '\'
    $full = Join-Path $RepoRoot $normalized
    $exists = Test-Path -LiteralPath $full
    $deleted = $false
    $errorMessage = $null

    if ($exists -and $Execute) {
        try {
            Remove-Item -LiteralPath $full -Force -Recurse
            $deleted = $true
        } catch {
            $errorMessage = $_.Exception.Message
        }
    }

    $Results += [pscustomobject]@{
        path = $rel
        fullPath = $full
        exists = $exists
        wouldDelete = ($exists -and -not $Execute)
        deleted = $deleted
        error = $errorMessage
    }
}

$Summary = [pscustomobject]@{
    step = $Step
    mode = $Mode
    total = $Candidates.Count
    present = @($Results | Where-Object { $_.exists }).Count
    missing = @($Results | Where-Object { -not $_.exists }).Count
    deleted = @($Results | Where-Object { $_.deleted }).Count
    wouldDelete = @($Results | Where-Object { $_.wouldDelete }).Count
    logJson = $LogJson
    logText = $LogText
    results = $Results
}

$Summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $LogJson -Encoding UTF8
$lines = @()
$lines += "step        : $($Summary.step)"
$lines += "mode        : $($Summary.mode)"
$lines += "total       : $($Summary.total)"
$lines += "present     : $($Summary.present)"
$lines += "missing     : $($Summary.missing)"
$lines += "deleted     : $($Summary.deleted)"
$lines += "wouldDelete : $($Summary.wouldDelete)"
$lines += "logJson     : $($Summary.logJson)"
$lines += "logText     : $($Summary.logText)"
$lines += ''
$lines += 'paths:'
foreach ($r in $Results) {
    $state = if ($r.deleted) { 'DELETED' } elseif ($r.wouldDelete) { 'WOULD_DELETE' } elseif ($r.exists) { 'PRESENT' } else { 'MISSING' }
    $lines += ("- {0}: {1}" -f $state, $r.path)
}
$lines | Set-Content -LiteralPath $LogText -Encoding UTF8

$Summary | Select-Object step, mode, total, present, missing, deleted, wouldDelete, logJson, logText | Format-List

if (-not $Execute) {
    Write-Host ''
    Write-Host 'Dry-Run only. Fuer echte Bereinigung erneut mit -Execute ausfuehren.'
}
