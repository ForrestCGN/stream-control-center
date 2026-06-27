param(
    [switch]$JsonOnly
)

$ErrorActionPreference = 'Stop'
$Step = 'RDAP_DOCS_CLEANUP_4_MODULE_DOCS_CONSOLIDATION'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$DocsCurrent = Join-Path $RepoRoot 'docs\current'
$ProjectState = Join-Path $RepoRoot 'project-state'
$HandoffDir = Join-Path $RepoRoot ('_handoff\' + $Step)
New-Item -ItemType Directory -Path $HandoffDir -Force | Out-Null
$Stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$LogJson = Join-Path $HandoffDir ("cleanup4_docs_current_scan_{0}.json" -f $Stamp)
$LogText = Join-Path $HandoffDir ("cleanup4_docs_current_scan_{0}.txt" -f $Stamp)

function Get-Category([string]$Name) {
    if ($Name -like 'START_HERE*' -or $Name -like 'MASTER_PROMPT*' -or $Name -like 'NEXT_CHAT_PROMPT_RDAP_DOCS_CLEANUP*') { return 'KEEP_CURRENT' }
    if ($Name -like 'CAN*' -or $Name -like 'STEP*') { return 'MERGE_OR_DELETE_CANDIDATE' }
    if ($Name -like 'RDAP*' -and $Name -notlike '*ARBEITSWEISE*') { return 'ARCHIVE_OR_MERGE_CANDIDATE' }
    if ($Name -match '(GENERATED|COMPARE|SCAN|INVENTORY|REPORT)') { return 'DELETE_OR_REGENERATE_CANDIDATE' }
    return 'REVIEW_MANUALLY'
}

$Docs = @()
if (Test-Path -LiteralPath $DocsCurrent) {
    $Docs = Get-ChildItem -LiteralPath $DocsCurrent -File | Sort-Object Name | ForEach-Object {
        [pscustomobject]@{
            name = $_.Name
            path = $_.FullName.Substring($RepoRoot.Length + 1)
            length = $_.Length
            category = Get-Category $_.Name
        }
    }
}

$ProjectRoot = @()
if (Test-Path -LiteralPath $ProjectState) {
    $ProjectRoot = Get-ChildItem -LiteralPath $ProjectState -File | Sort-Object Name | ForEach-Object {
        [pscustomobject]@{
            name = $_.Name
            path = $_.FullName.Substring($RepoRoot.Length + 1)
            length = $_.Length
        }
    }
}

$Summary = [pscustomobject]@{
    step = $Step
    docsCurrentCount = @($Docs).Count
    projectStateRootFileCount = @($ProjectRoot).Count
    categoryCounts = @($Docs | Group-Object category | Sort-Object Name | ForEach-Object { [pscustomobject]@{ category = $_.Name; count = $_.Count } })
    logJson = $LogJson
    logText = $LogText
    docs = $Docs
    projectStateRoot = $ProjectRoot
}

$Summary | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $LogJson -Encoding UTF8
$lines = @()
$lines += "step                  : $($Summary.step)"
$lines += "docsCurrentCount      : $($Summary.docsCurrentCount)"
$lines += "projectStateRootFiles : $($Summary.projectStateRootFileCount)"
$lines += "logJson               : $($Summary.logJson)"
$lines += "logText               : $($Summary.logText)"
$lines += ''
$lines += 'categoryCounts:'
foreach ($c in $Summary.categoryCounts) { $lines += ("- {0}: {1}" -f $c.category, $c.count) }
$lines += ''
$lines += 'Hinweis: Dieses Script loescht nichts.'
$lines | Set-Content -LiteralPath $LogText -Encoding UTF8
if (-not $JsonOnly) { $lines | ForEach-Object { Write-Host $_ } }
