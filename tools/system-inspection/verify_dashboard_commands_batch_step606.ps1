param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ProjectRoot)) {
  throw ("Projektpfad nicht gefunden: " + $ProjectRoot)
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path -Path $ProjectRoot -ChildPath "system-scan-output"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$dashboardDocRel = "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md"
$dashboardDocPath = Join-Path $ProjectRoot ($dashboardDocRel.Replace("/", "\"))

$step605RowsTsv = Join-Path $OutDir "step605_dashboard_commands_module_docs_batch_rows.tsv"
$step598SummaryTsv = Join-Path $OutDir "step598_module_route_docs_batch_summary.tsv"
$step598RowsTsv = Join-Path $OutDir "step598_module_route_docs_batch_rows.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($dashboardDocPath,$step605RowsTsv,$step598SummaryTsv,$step598RowsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$rows605 = @()
$step598Summary = @()
$step598Rows = @()

if (Test-Path -LiteralPath $step605RowsTsv) { $rows605 = @(Import-Csv -LiteralPath $step605RowsTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $step598SummaryTsv) { $step598Summary = @(Import-Csv -LiteralPath $step598SummaryTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $step598RowsTsv) { $step598Rows = @(Import-Csv -LiteralPath $step598RowsTsv -Delimiter "`t") }

function IntVal {
  param($Value)
  $n = 0
  [int]::TryParse([string]$Value, [ref]$n) | Out-Null
  return $n
}

function Escape-MdCell {
  param([string]$Text)
  if ($null -eq $Text) { return "" }
  $s = [string]$Text
  $s = $s.Replace("|", "/")
  $s = $s.Replace("`r", " ")
  $s = $s.Replace("`n", " ")
  return $s
}

$content = ""
$has605 = $false
if (Test-Path -LiteralPath $dashboardDocPath) {
  $content = Get-Content -LiteralPath $dashboardDocPath -Raw -Encoding UTF8
  $has605 = ($content.Contains("<!-- STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH_START -->") -and $content.Contains("<!-- STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH_END -->"))
}

if (-not $has605) {
  $warnings += "STEP605 section not found in " + $dashboardDocRel
}

$hits605 = 0
foreach ($r in $rows605) { $hits605 += IntVal $r.routeHitCount }

$completedBatches = @{}
$completedBatches["Z_backend_routes_inventory"] = $true
$completedBatches["F_current_status_crossmodule"] = $true
$completedBatches["A_channelpoints"] = $true
$completedBatches["D_dashboard_commands"] = $true

$remainingBatchSummary = @(
  $step598Summary |
    Where-Object {
      (-not $completedBatches.ContainsKey([string]$_.batch)) -and
      ([string]$_.primaryTarget -notmatch "docs/backend/ROUTES.md")
    } |
    Sort-Object @{Expression={IntVal $_.highPriority};Descending=$true},
                @{Expression={IntVal $_.totalRouteHits};Descending=$true},
                batch
)

$nextBatch = $null
if (@($remainingBatchSummary).Count -gt 0) {
  $nextBatch = $remainingBatchSummary[0]
}

$nextBatchName = ""
$nextTarget = ""
$nextModules = 0
$nextHigh = 0
$nextReview = 0
$nextHits = 0

if ($null -ne $nextBatch) {
  $nextBatchName = [string]$nextBatch.batch
  $nextTarget = [string]$nextBatch.primaryTarget
  $nextModules = IntVal $nextBatch.modules
  $nextHigh = IntVal $nextBatch.highPriority
  $nextReview = IntVal $nextBatch.reviewPriority
  $nextHits = IntVal $nextBatch.totalRouteHits
} else {
  $warnings += "No remaining real module-doc batch found after STEP605."
}

$nextRows = @()
if (-not [string]::IsNullOrWhiteSpace($nextBatchName)) {
  $nextRows = @($step598Rows | Where-Object { $_.batch -eq $nextBatchName })
}

$batch605 = ""
if (@($rows605).Count -gt 0) { $batch605 = [string]$rows605[0].batch }
$target605 = ""
if (@($rows605).Count -gt 0) { $target605 = [string]$rows605[0].proposedDocTarget }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step606_dashboard_commands_batch_verification_summary.txt"
$nextRowsTsv = Join-Path $OutDir "step606_next_real_module_doc_batch_rows.tsv"
$remainingSummaryTsv = Join-Path $OutDir "step606_remaining_real_module_doc_batches.tsv"
$mdPath = Join-Path $OutDir "step606_dashboard_commands_batch_verification.md"
$jsonPath = Join-Path $OutDir "step606_dashboard_commands_batch_verification.json"

$nextRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $nextRowsTsv -Encoding UTF8
$remainingBatchSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $remainingSummaryTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    dashboardDoc = $dashboardDocRel
    hasStep605Section = $has605
    step605Batch = $batch605
    step605Target = $target605
    step605Modules = @($rows605).Count
    step605RouteHits = $hits605
    completedBatches = @("Z_backend_routes_inventory","F_current_status_crossmodule","A_channelpoints","D_dashboard_commands")
    nextRealBatch = $nextBatchName
    nextRealTarget = $nextTarget
    nextRealModules = $nextModules
    nextRealHighPriority = $nextHigh
    nextRealReviewPriority = $nextReview
    nextRealRouteHits = $nextHits
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  nextBatch = $nextBatch
  nextRows = $nextRows
  remainingBatches = $remainingBatchSummary
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP606 Dashboard Commands Batch Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Dashboard Commands doc STEP605 section present: " + $has605)
$md.Add("")
$md.Add("STEP605 batch: " + $batch605)
$md.Add("STEP605 target: " + $target605)
$md.Add("STEP605 modules: " + @($rows605).Count)
$md.Add("STEP605 route hits: " + $hits605)
$md.Add("")
$md.Add("Completed route-doc batches:")
$md.Add("- Z_backend_routes_inventory")
$md.Add("- F_current_status_crossmodule")
$md.Add("- A_channelpoints")
$md.Add("- D_dashboard_commands")
$md.Add("")
$md.Add("## Naechster echter Modul-Doku-Batch")
$md.Add("")
$md.Add("Batch: " + $nextBatchName)
$md.Add("Target: " + $nextTarget)
$md.Add("Modules: " + $nextModules)
$md.Add("High priority: " + $nextHigh)
$md.Add("Review priority: " + $nextReview)
$md.Add("Route hits: " + $nextHits)
$md.Add("")
$md.Add("## Module im naechsten Batch")
$md.Add("")
$md.Add("| Priority | Module | File | Route Hits | Target | Action |")
$md.Add("|---|---|---|---:|---|---|")
foreach ($r in ($nextRows | Sort-Object priority,module)) {
  $md.Add("| " + (Escape-MdCell $r.priority) + " | " + (Escape-MdCell $r.module) + " | " + (Escape-MdCell $r.file) + " | " + $r.routeHitCount + " | " + (Escape-MdCell $r.proposedDocTarget) + " | " + (Escape-MdCell $r.recommendedAction) + " |")
}
$md.Add("")
$md.Add("## Naechster STEP")
$md.Add("")
$md.Add("STEP607 - Module Route Docs Batch E")
$md.Add("")
$md.Add("Ziel: Den naechsten echten Modul-Doku-Batch in der Ziel-Doku ergaenzen.")
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP606 Dashboard Commands Batch Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "Dashboard doc: " + $dashboardDocRel
$summary += "Has STEP605 section: " + $has605
$summary += "STEP605 batch: " + $batch605
$summary += "STEP605 target: " + $target605
$summary += "STEP605 modules: " + @($rows605).Count
$summary += "STEP605 route hits: " + $hits605
$summary += "Next real batch: " + $nextBatchName
$summary += "Next real target: " + $nextTarget
$summary += "Next real modules: " + $nextModules
$summary += "Next real high-priority modules: " + $nextHigh
$summary += "Next real route hits: " + $nextHits
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
if (@($warnings).Count -gt 0) {
  $summary += ""
  $summary += "Warnings:"
  foreach ($w in $warnings) { $summary += ("WARN | " + $w) }
}
if (@($errors).Count -gt 0) {
  $summary += ""
  $summary += "Errors:"
  foreach ($e in $errors) { $summary += ("ERROR | " + $e) }
}
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

Write-Host ""
Write-Host "STEP606 Dashboard Commands Batch Verification fertig."
Write-Host ("Dashboard doc: " + $dashboardDocRel)
Write-Host ("Has STEP605 section: " + $has605)
Write-Host ("STEP605 batch: " + $batch605)
Write-Host ("STEP605 target: " + $target605)
Write-Host ("STEP605 modules: " + @($rows605).Count)
Write-Host ("STEP605 route hits: " + $hits605)
Write-Host ("Next real batch: " + $nextBatchName)
Write-Host ("Next real target: " + $nextTarget)
Write-Host ("Next real modules: " + $nextModules)
Write-Host ("Next real high-priority modules: " + $nextHigh)
Write-Host ("Next real route hits: " + $nextHits)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Next rows TSV: " + $nextRowsTsv)
Write-Host ("Remaining batches TSV: " + $remainingSummaryTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Dashboard doc: " + $dashboardDocRel)
Write-Host ("Has STEP605 section: " + $has605)
Write-Host ("STEP605 batch: " + $batch605)
Write-Host ("STEP605 target: " + $target605)
Write-Host ("STEP605 modules: " + @($rows605).Count)
Write-Host ("STEP605 route hits: " + $hits605)
Write-Host ("Next real batch: " + $nextBatchName)
Write-Host ("Next real target: " + $nextTarget)
Write-Host ("Next real modules: " + $nextModules)
Write-Host ("Next real high-priority modules: " + $nextHigh)
Write-Host ("Next real route hits: " + $nextHits)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
