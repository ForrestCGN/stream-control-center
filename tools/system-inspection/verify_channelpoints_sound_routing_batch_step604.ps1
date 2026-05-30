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

$channelDocRel = "docs/modules/channelpoints.md"
$soundDocRel = "docs/modules/sound_system_channelpoints_routing.md"
$channelDocPath = Join-Path $ProjectRoot ($channelDocRel.Replace("/", "\"))
$soundDocPath = Join-Path $ProjectRoot ($soundDocRel.Replace("/", "\"))

$step603aRowsTsv = Join-Path $OutDir "step603a_channelpoints_module_docs_batch_rows.tsv"
$step603bRowsTsv = Join-Path $OutDir "step603b_sound_system_routing_docs_batch_rows.tsv"
$step598SummaryTsv = Join-Path $OutDir "step598_module_route_docs_batch_summary.tsv"
$step598RowsTsv = Join-Path $OutDir "step598_module_route_docs_batch_rows.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($channelDocPath,$soundDocPath,$step603aRowsTsv,$step603bRowsTsv,$step598SummaryTsv,$step598RowsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$rowsA = @()
$rowsB = @()
$step598Summary = @()
$step598Rows = @()

if (Test-Path -LiteralPath $step603aRowsTsv) { $rowsA = @(Import-Csv -LiteralPath $step603aRowsTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $step603bRowsTsv) { $rowsB = @(Import-Csv -LiteralPath $step603bRowsTsv -Delimiter "`t") }
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

$channelContent = ""
$soundContent = ""
$has603a = $false
$has603b = $false

if (Test-Path -LiteralPath $channelDocPath) {
  $channelContent = Get-Content -LiteralPath $channelDocPath -Raw -Encoding UTF8
  $has603a = ($channelContent.Contains("<!-- STEP603A_CHANNELPOINTS_MODULE_DOCS_BATCH_START -->") -and $channelContent.Contains("<!-- STEP603A_CHANNELPOINTS_MODULE_DOCS_BATCH_END -->"))
}

if (Test-Path -LiteralPath $soundDocPath) {
  $soundContent = Get-Content -LiteralPath $soundDocPath -Raw -Encoding UTF8
  $has603b = ($soundContent.Contains("<!-- STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH_START -->") -and $soundContent.Contains("<!-- STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH_END -->"))
}

if (-not $has603a) { $warnings += "STEP603A section not found in " + $channelDocRel }
if (-not $has603b) { $warnings += "STEP603B section not found in " + $soundDocRel }

$hitsA = 0
foreach ($r in $rowsA) { $hitsA += IntVal $r.routeHitCount }
$hitsB = 0
foreach ($r in $rowsB) { $hitsB += IntVal $r.routeHitCount }

$completedBatches = @{}
$completedBatches["Z_backend_routes_inventory"] = $true
$completedBatches["F_current_status_crossmodule"] = $true
$completedBatches["A_channelpoints"] = $true

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
  $warnings += "No remaining real module-doc batch found after STEP603A/B."
}

$nextRows = @()
if (-not [string]::IsNullOrWhiteSpace($nextBatchName)) {
  $nextRows = @($step598Rows | Where-Object { $_.batch -eq $nextBatchName })
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step604_channelpoints_sound_routing_verification_summary.txt"
$nextRowsTsv = Join-Path $OutDir "step604_next_real_module_doc_batch_rows.tsv"
$remainingSummaryTsv = Join-Path $OutDir "step604_remaining_real_module_doc_batches.tsv"
$mdPath = Join-Path $OutDir "step604_channelpoints_sound_routing_verification.md"
$jsonPath = Join-Path $OutDir "step604_channelpoints_sound_routing_verification.json"

$nextRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $nextRowsTsv -Encoding UTF8
$remainingBatchSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $remainingSummaryTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    channelDoc = $channelDocRel
    soundDoc = $soundDocRel
    hasStep603ASection = $has603a
    hasStep603BSection = $has603b
    step603AModules = @($rowsA).Count
    step603ARouteHits = $hitsA
    step603BModules = @($rowsB).Count
    step603BRouteHits = $hitsB
    completedBatch = "A_channelpoints"
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
$md.Add("# STEP604 Channelpoints/Sound Routing Batch Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Channelpoints doc STEP603A section present: " + $has603a)
$md.Add("Sound routing doc STEP603B section present: " + $has603b)
$md.Add("")
$md.Add("STEP603A modules: " + @($rowsA).Count)
$md.Add("STEP603A route hits: " + $hitsA)
$md.Add("STEP603B modules: " + @($rowsB).Count)
$md.Add("STEP603B route hits: " + $hitsB)
$md.Add("")
$md.Add("Completed batch: A_channelpoints")
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
$md.Add("STEP605 - Module Route Docs Batch D")
$md.Add("")
$md.Add("Ziel: Den naechsten echten Modul-Doku-Batch in der Ziel-Doku ergaenzen.")
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP604 Channelpoints/Sound Routing Batch Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "Channelpoints doc: " + $channelDocRel
$summary += "Sound doc: " + $soundDocRel
$summary += "Has STEP603A section: " + $has603a
$summary += "Has STEP603B section: " + $has603b
$summary += "STEP603A modules: " + @($rowsA).Count
$summary += "STEP603A route hits: " + $hitsA
$summary += "STEP603B modules: " + @($rowsB).Count
$summary += "STEP603B route hits: " + $hitsB
$summary += "Completed batch: A_channelpoints"
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
Write-Host "STEP604 Channelpoints/Sound Routing Batch Verification fertig."
Write-Host ("Channelpoints doc: " + $channelDocRel)
Write-Host ("Sound doc: " + $soundDocRel)
Write-Host ("Has STEP603A section: " + $has603a)
Write-Host ("Has STEP603B section: " + $has603b)
Write-Host ("STEP603A modules: " + @($rowsA).Count)
Write-Host ("STEP603A route hits: " + $hitsA)
Write-Host ("STEP603B modules: " + @($rowsB).Count)
Write-Host ("STEP603B route hits: " + $hitsB)
Write-Host ("Completed batch: A_channelpoints")
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
Write-Host ("Channelpoints doc: " + $channelDocRel)
Write-Host ("Sound doc: " + $soundDocRel)
Write-Host ("Has STEP603A section: " + $has603a)
Write-Host ("Has STEP603B section: " + $has603b)
Write-Host ("STEP603A modules: " + @($rowsA).Count)
Write-Host ("STEP603A route hits: " + $hitsA)
Write-Host ("STEP603B modules: " + @($rowsB).Count)
Write-Host ("STEP603B route hits: " + $hitsB)
Write-Host ("Completed batch: A_channelpoints")
Write-Host ("Next real batch: " + $nextBatchName)
Write-Host ("Next real target: " + $nextTarget)
Write-Host ("Next real modules: " + $nextModules)
Write-Host ("Next real high-priority modules: " + $nextHigh)
Write-Host ("Next real route hits: " + $nextHits)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
