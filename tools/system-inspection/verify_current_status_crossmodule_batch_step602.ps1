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

$currentStatusRel = "docs/current/CURRENT_SYSTEM_STATUS.md"
$currentStatusPath = Join-Path $ProjectRoot ($currentStatusRel.Replace("/", "\"))
$step601RowsTsv = Join-Path $OutDir "step601_current_status_crossmodule_batch_rows.tsv"
$step598SummaryTsv = Join-Path $OutDir "step598_module_route_docs_batch_summary.tsv"
$step598RowsTsv = Join-Path $OutDir "step598_module_route_docs_batch_rows.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($currentStatusPath,$step601RowsTsv,$step598SummaryTsv,$step598RowsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$step601Rows = @()
$step598Summary = @()
$step598Rows = @()

if (Test-Path -LiteralPath $step601RowsTsv) { $step601Rows = @(Import-Csv -LiteralPath $step601RowsTsv -Delimiter "`t") }
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
$hasStep601Section = $false
if (Test-Path -LiteralPath $currentStatusPath) {
  $content = Get-Content -LiteralPath $currentStatusPath -Raw -Encoding UTF8
  $hasStep601Section = ($content.Contains("<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_START -->") -and $content.Contains("<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_END -->"))
}

if (-not $hasStep601Section) {
  $warnings += "STEP601 section not found in docs/current/CURRENT_SYSTEM_STATUS.md"
}

$completedBatches = @{}
$completedBatches["Z_backend_routes_inventory"] = $true
$completedBatches["F_current_status_crossmodule"] = $true

# Pick next real module-doc batch: exclude already completed and docs/backend/ROUTES.md.
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
  $warnings += "No remaining real module-doc batch found after STEP601."
}

$nextRows = @()
if (-not [string]::IsNullOrWhiteSpace($nextBatchName)) {
  $nextRows = @($step598Rows | Where-Object { $_.batch -eq $nextBatchName })
}

$step601Batch = ""
if (@($step601Rows).Count -gt 0) { $step601Batch = [string]$step601Rows[0].batch }
$step601Target = ""
if (@($step601Rows).Count -gt 0) { $step601Target = [string]$step601Rows[0].proposedDocTarget }

$step601Hits = 0
foreach ($r in $step601Rows) { $step601Hits += IntVal $r.routeHitCount }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step602_current_status_crossmodule_verification_summary.txt"
$nextRowsTsv = Join-Path $OutDir "step602_next_real_module_doc_batch_rows.tsv"
$remainingSummaryTsv = Join-Path $OutDir "step602_remaining_real_module_doc_batches.tsv"
$mdPath = Join-Path $OutDir "step602_current_status_crossmodule_verification.md"
$jsonPath = Join-Path $OutDir "step602_current_status_crossmodule_verification.json"

$nextRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $nextRowsTsv -Encoding UTF8
$remainingBatchSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $remainingSummaryTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    currentStatusDoc = $currentStatusRel
    hasStep601Section = $hasStep601Section
    completedBatches = @("Z_backend_routes_inventory","F_current_status_crossmodule")
    step601Batch = $step601Batch
    step601Target = $step601Target
    step601Modules = @($step601Rows).Count
    step601RouteHits = $step601Hits
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
$md.Add("# STEP602 Current Status Crossmodule Batch Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("CURRENT_SYSTEM_STATUS.md STEP601 section present: " + $hasStep601Section)
$md.Add("")
$md.Add("Completed route-doc batches:")
$md.Add("- Z_backend_routes_inventory")
$md.Add("- F_current_status_crossmodule")
$md.Add("")
$md.Add("STEP601 batch: " + $step601Batch)
$md.Add("STEP601 target: " + $step601Target)
$md.Add("STEP601 modules: " + @($step601Rows).Count)
$md.Add("STEP601 route hits: " + $step601Hits)
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
$md.Add("STEP603 - Module Route Docs Batch C")
$md.Add("")
$md.Add("Ziel: Den naechsten echten Modul-Doku-Batch in der Ziel-Doku ergaenzen, ohne neue Einzel-Dokus pro Modul zu erzeugen.")
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP602 Current Status Crossmodule Batch Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "Current status doc: " + $currentStatusRel
$summary += "Has STEP601 section: " + $hasStep601Section
$summary += "STEP601 batch: " + $step601Batch
$summary += "STEP601 target: " + $step601Target
$summary += "STEP601 modules: " + @($step601Rows).Count
$summary += "STEP601 route hits: " + $step601Hits
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
Write-Host "STEP602 Current Status Crossmodule Batch Verification fertig."
Write-Host ("Current status doc: " + $currentStatusRel)
Write-Host ("Has STEP601 section: " + $hasStep601Section)
Write-Host ("STEP601 batch: " + $step601Batch)
Write-Host ("STEP601 target: " + $step601Target)
Write-Host ("STEP601 modules: " + @($step601Rows).Count)
Write-Host ("STEP601 route hits: " + $step601Hits)
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
Write-Host ("Current status doc: " + $currentStatusRel)
Write-Host ("Has STEP601 section: " + $hasStep601Section)
Write-Host ("STEP601 batch: " + $step601Batch)
Write-Host ("STEP601 target: " + $step601Target)
Write-Host ("STEP601 modules: " + @($step601Rows).Count)
Write-Host ("STEP601 route hits: " + $step601Hits)
Write-Host ("Next real batch: " + $nextBatchName)
Write-Host ("Next real target: " + $nextTarget)
Write-Host ("Next real modules: " + $nextModules)
Write-Host ("Next real high-priority modules: " + $nextHigh)
Write-Host ("Next real route hits: " + $nextHits)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
