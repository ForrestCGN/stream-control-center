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

$routesDocRel = "docs/backend/ROUTES.md"
$routesDocPath = Join-Path $ProjectRoot ($routesDocRel.Replace("/", "\"))
$step599RowsTsv = Join-Path $OutDir "step599_module_route_docs_batch_a_rows.tsv"
$step598SummaryTsv = Join-Path $OutDir "step598_module_route_docs_batch_summary.tsv"
$step598RowsTsv = Join-Path $OutDir "step598_module_route_docs_batch_rows.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($routesDocPath,$step599RowsTsv,$step598SummaryTsv,$step598RowsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$step599Rows = @()
$step598Summary = @()
$step598Rows = @()

if (Test-Path -LiteralPath $step599RowsTsv) { $step599Rows = @(Import-Csv -LiteralPath $step599RowsTsv -Delimiter "`t") }
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

$routesDocContent = ""
$hasStep599Section = $false
$hasStep596Section = $false
$hasStep597Section = $false
if (Test-Path -LiteralPath $routesDocPath) {
  $routesDocContent = Get-Content -LiteralPath $routesDocPath -Raw -Encoding UTF8
  $hasStep599Section = ($routesDocContent.Contains("<!-- STEP599_MODULE_ROUTE_DOCS_BATCH_A_START -->") -and $routesDocContent.Contains("<!-- STEP599_MODULE_ROUTE_DOCS_BATCH_A_END -->"))
  $hasStep596Section = ($routesDocContent.Contains("<!-- STEP596_MISSING_ROUTES_DOC_BATCH_START -->") -and $routesDocContent.Contains("<!-- STEP596_MISSING_ROUTES_DOC_BATCH_END -->"))
  $hasStep597Section = ($routesDocContent.Contains("<!-- STEP597_FALSE_POSITIVE_REVIEW_START -->") -and $routesDocContent.Contains("<!-- STEP597_FALSE_POSITIVE_REVIEW_END -->"))
}

if (-not $hasStep599Section) { $warnings += "STEP599 section not found in docs/backend/ROUTES.md" }
if (-not $hasStep596Section) { $warnings += "STEP596 section not found in docs/backend/ROUTES.md" }
if (-not $hasStep597Section) { $warnings += "STEP597 section not found in docs/backend/ROUTES.md" }

$selectedBatch = ""
if (@($step599Rows).Count -gt 0) { $selectedBatch = [string]$step599Rows[0].batch }

$selectedTarget = ""
if (@($step599Rows).Count -gt 0) { $selectedTarget = [string]$step599Rows[0].proposedDocTarget }

$selectedRouteHits = 0
foreach ($r in $step599Rows) { $selectedRouteHits += IntVal $r.routeHitCount }

# Pick next real module-doc batch: exclude backend routes inventory target and selected batch.
$remainingBatchSummary = @(
  $step598Summary |
    Where-Object {
      ([string]$_.batch -ne $selectedBatch) -and
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
  $warnings += "No remaining real module-doc batch found after excluding docs/backend/ROUTES.md."
}

$nextRows = @()
if (-not [string]::IsNullOrWhiteSpace($nextBatchName)) {
  $nextRows = @($step598Rows | Where-Object { $_.batch -eq $nextBatchName })
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step600_module_route_docs_batch_a_verification_summary.txt"
$nextRowsTsv = Join-Path $OutDir "step600_next_real_module_doc_batch_rows.tsv"
$remainingSummaryTsv = Join-Path $OutDir "step600_remaining_real_module_doc_batches.tsv"
$mdPath = Join-Path $OutDir "step600_module_route_docs_batch_a_verification.md"
$jsonPath = Join-Path $OutDir "step600_module_route_docs_batch_a_verification.json"

$nextRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $nextRowsTsv -Encoding UTF8
$remainingBatchSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $remainingSummaryTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    routesDoc = $routesDocRel
    hasStep596Section = $hasStep596Section
    hasStep597Section = $hasStep597Section
    hasStep599Section = $hasStep599Section
    selectedBatch = $selectedBatch
    selectedTarget = $selectedTarget
    selectedModules = @($step599Rows).Count
    selectedRouteHits = $selectedRouteHits
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
$md.Add("# STEP600 Module Route Docs Batch A Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("ROUTES.md STEP596 section present: " + $hasStep596Section)
$md.Add("ROUTES.md STEP597 section present: " + $hasStep597Section)
$md.Add("ROUTES.md STEP599 section present: " + $hasStep599Section)
$md.Add("")
$md.Add("Selected STEP599 batch: " + $selectedBatch)
$md.Add("Selected STEP599 target: " + $selectedTarget)
$md.Add("Selected modules: " + @($step599Rows).Count)
$md.Add("Selected route hits: " + $selectedRouteHits)
$md.Add("")
$md.Add("## Bewertung")
$md.Add("")
$md.Add("STEP599 hat den Batch " + $selectedBatch + " in " + $selectedTarget + " dokumentiert.")
$md.Add("")
$md.Add("Damit wurde die zentrale Routen-Inventur weiter abgesichert. Der naechste Schritt sollte nun bewusst eine echte Modul-/Konsolidierungsdoku ausserhalb von docs/backend/ROUTES.md anfassen.")
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
$md.Add("STEP601 - Module Route Docs Batch B")
$md.Add("")
$md.Add("Ziel: Den naechsten echten Modul-Doku-Batch in der Ziel-Doku ergaenzen, ohne neue Einzel-Dokus pro Modul zu erzeugen.")
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP600 Module Route Docs Batch A Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "Routes doc: " + $routesDocRel
$summary += "Has STEP596 section: " + $hasStep596Section
$summary += "Has STEP597 section: " + $hasStep597Section
$summary += "Has STEP599 section: " + $hasStep599Section
$summary += "Selected batch: " + $selectedBatch
$summary += "Selected target: " + $selectedTarget
$summary += "Selected modules: " + @($step599Rows).Count
$summary += "Selected route hits: " + $selectedRouteHits
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
Write-Host "STEP600 Module Route Docs Batch A Verification fertig."
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("Has STEP596 section: " + $hasStep596Section)
Write-Host ("Has STEP597 section: " + $hasStep597Section)
Write-Host ("Has STEP599 section: " + $hasStep599Section)
Write-Host ("Selected batch: " + $selectedBatch)
Write-Host ("Selected target: " + $selectedTarget)
Write-Host ("Selected modules: " + @($step599Rows).Count)
Write-Host ("Selected route hits: " + $selectedRouteHits)
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
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("Has STEP596 section: " + $hasStep596Section)
Write-Host ("Has STEP597 section: " + $hasStep597Section)
Write-Host ("Has STEP599 section: " + $hasStep599Section)
Write-Host ("Selected batch: " + $selectedBatch)
Write-Host ("Selected target: " + $selectedTarget)
Write-Host ("Selected modules: " + @($step599Rows).Count)
Write-Host ("Selected route hits: " + $selectedRouteHits)
Write-Host ("Next real batch: " + $nextBatchName)
Write-Host ("Next real target: " + $nextTarget)
Write-Host ("Next real modules: " + $nextModules)
Write-Host ("Next real high-priority modules: " + $nextHigh)
Write-Host ("Next real route hits: " + $nextHits)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
