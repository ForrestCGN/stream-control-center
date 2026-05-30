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

$shoutoutDocRel = "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md"
$shoutoutDocPath = Join-Path $ProjectRoot ($shoutoutDocRel.Replace("/", "\"))

$step609RowsTsv = Join-Path $OutDir "step609_shoutout_clip_features_docs_batch_rows.tsv"
$step598SummaryTsv = Join-Path $OutDir "step598_module_route_docs_batch_summary.tsv"
$step598RowsTsv = Join-Path $OutDir "step598_module_route_docs_batch_rows.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($shoutoutDocPath,$step609RowsTsv,$step598SummaryTsv,$step598RowsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$rows609 = @()
$step598Summary = @()
$step598Rows = @()

if (Test-Path -LiteralPath $step609RowsTsv) { $rows609 = @(Import-Csv -LiteralPath $step609RowsTsv -Delimiter "`t") }
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
$has609 = $false
if (Test-Path -LiteralPath $shoutoutDocPath) {
  $content = Get-Content -LiteralPath $shoutoutDocPath -Raw -Encoding UTF8
  $has609 = ($content.Contains("<!-- STEP609_SHOUTOUT_CLIP_FEATURES_DOCS_BATCH_START -->") -and $content.Contains("<!-- STEP609_SHOUTOUT_CLIP_FEATURES_DOCS_BATCH_END -->"))
}

if (-not $has609) {
  $warnings += "STEP609 section not found in " + $shoutoutDocRel
}

$hits609 = 0
foreach ($r in $rows609) { $hits609 += IntVal $r.routeHitCount }

$completedBatches = @{}
$completedBatches["Z_backend_routes_inventory"] = $true
$completedBatches["F_current_status_crossmodule"] = $true
$completedBatches["A_channelpoints"] = $true
$completedBatches["D_dashboard_commands"] = $true
$completedBatches["C_communication_bus"] = $true
$completedBatches["E_shoutout_clip_features"] = $true

$remainingAll = @(
  $step598Summary |
    Where-Object { -not $completedBatches.ContainsKey([string]$_.batch) } |
    Sort-Object @{Expression={IntVal $_.highPriority};Descending=$true},
                @{Expression={IntVal $_.totalRouteHits};Descending=$true},
                batch
)

$remainingReal = @(
  $remainingAll |
    Where-Object { [string]$_.primaryTarget -notmatch "docs/backend/ROUTES.md" }
)

$remainingRoutesOnly = @(
  $remainingAll |
    Where-Object { [string]$_.primaryTarget -match "docs/backend/ROUTES.md" }
)

$nextBatch = $null
if (@($remainingReal).Count -gt 0) {
  $nextBatch = $remainingReal[0]
} elseif (@($remainingRoutesOnly).Count -gt 0) {
  $nextBatch = $remainingRoutesOnly[0]
  $warnings += "No remaining real module-doc batch found; next remaining batch targets central ROUTES inventory."
}

$nextBatchName = ""
$nextTarget = ""
$nextModules = 0
$nextHigh = 0
$nextReview = 0
$nextHits = 0
$nextIsRoutesOnly = $false

if ($null -ne $nextBatch) {
  $nextBatchName = [string]$nextBatch.batch
  $nextTarget = [string]$nextBatch.primaryTarget
  $nextModules = IntVal $nextBatch.modules
  $nextHigh = IntVal $nextBatch.highPriority
  $nextReview = IntVal $nextBatch.reviewPriority
  $nextHits = IntVal $nextBatch.totalRouteHits
  $nextIsRoutesOnly = ([string]$nextTarget -match "docs/backend/ROUTES.md")
} else {
  $warnings += "No remaining module-doc batch found after STEP609."
}

$nextRows = @()
if (-not [string]::IsNullOrWhiteSpace($nextBatchName)) {
  $nextRows = @($step598Rows | Where-Object { $_.batch -eq $nextBatchName })
}

$batch609 = ""
if (@($rows609).Count -gt 0) { $batch609 = [string]$rows609[0].batch }
$target609 = ""
if (@($rows609).Count -gt 0) { $target609 = [string]$rows609[0].proposedDocTarget }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step610_shoutout_clip_features_batch_verification_summary.txt"
$nextRowsTsv = Join-Path $OutDir "step610_next_module_doc_batch_rows.tsv"
$remainingRealTsv = Join-Path $OutDir "step610_remaining_real_module_doc_batches.tsv"
$remainingAllTsv = Join-Path $OutDir "step610_remaining_all_module_doc_batches.tsv"
$remainingRoutesTsv = Join-Path $OutDir "step610_remaining_routes_inventory_batches.tsv"
$mdPath = Join-Path $OutDir "step610_shoutout_clip_features_batch_verification.md"
$jsonPath = Join-Path $OutDir "step610_shoutout_clip_features_batch_verification.json"

$nextRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $nextRowsTsv -Encoding UTF8
$remainingReal | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $remainingRealTsv -Encoding UTF8
$remainingAll | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $remainingAllTsv -Encoding UTF8
$remainingRoutesOnly | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $remainingRoutesTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    shoutoutDoc = $shoutoutDocRel
    hasStep609Section = $has609
    step609Batch = $batch609
    step609Target = $target609
    step609Modules = @($rows609).Count
    step609RouteHits = $hits609
    completedBatches = @("Z_backend_routes_inventory","F_current_status_crossmodule","A_channelpoints","D_dashboard_commands","C_communication_bus","E_shoutout_clip_features")
    remainingRealBatches = @($remainingReal).Count
    remainingRoutesInventoryBatches = @($remainingRoutesOnly).Count
    remainingAllBatches = @($remainingAll).Count
    nextBatch = $nextBatchName
    nextTarget = $nextTarget
    nextModules = $nextModules
    nextHighPriority = $nextHigh
    nextReviewPriority = $nextReview
    nextRouteHits = $nextHits
    nextIsRoutesOnly = $nextIsRoutesOnly
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  nextBatch = $nextBatch
  nextRows = $nextRows
  remainingRealBatches = $remainingReal
  remainingRoutesInventoryBatches = $remainingRoutesOnly
  remainingAllBatches = $remainingAll
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP610 Shoutout / Clip Features Batch Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Shoutout doc STEP609 section present: " + $has609)
$md.Add("")
$md.Add("STEP609 batch: " + $batch609)
$md.Add("STEP609 target: " + $target609)
$md.Add("STEP609 modules: " + @($rows609).Count)
$md.Add("STEP609 route hits: " + $hits609)
$md.Add("")
$md.Add("## Reststatus")
$md.Add("")
$md.Add("Remaining real module-doc batches: " + @($remainingReal).Count)
$md.Add("Remaining central ROUTES inventory batches: " + @($remainingRoutesOnly).Count)
$md.Add("Remaining all batches: " + @($remainingAll).Count)
$md.Add("")
$md.Add("## Naechster Batch")
$md.Add("")
$md.Add("Batch: " + $nextBatchName)
$md.Add("Target: " + $nextTarget)
$md.Add("Modules: " + $nextModules)
$md.Add("High priority: " + $nextHigh)
$md.Add("Review priority: " + $nextReview)
$md.Add("Route hits: " + $nextHits)
$md.Add("Routes-only: " + $nextIsRoutesOnly)
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
if (@($remainingReal).Count -gt 0) {
  $md.Add("STEP611 - Next Real Module Docs Batch")
} elseif (@($remainingRoutesOnly).Count -gt 0) {
  $md.Add("STEP611 - Central ROUTES Inventory Remaining Batch Review")
} else {
  $md.Add("STEP611 - Final Module Route Docs Verification")
}
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP610 Shoutout / Clip Features Batch Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "Shoutout doc: " + $shoutoutDocRel
$summary += "Has STEP609 section: " + $has609
$summary += "STEP609 batch: " + $batch609
$summary += "STEP609 target: " + $target609
$summary += "STEP609 modules: " + @($rows609).Count
$summary += "STEP609 route hits: " + $hits609
$summary += "Remaining real module-doc batches: " + @($remainingReal).Count
$summary += "Remaining central ROUTES inventory batches: " + @($remainingRoutesOnly).Count
$summary += "Remaining all batches: " + @($remainingAll).Count
$summary += "Next batch: " + $nextBatchName
$summary += "Next target: " + $nextTarget
$summary += "Next modules: " + $nextModules
$summary += "Next high-priority modules: " + $nextHigh
$summary += "Next route hits: " + $nextHits
$summary += "Next routes-only: " + $nextIsRoutesOnly
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
Write-Host "STEP610 Shoutout / Clip Features Batch Verification fertig."
Write-Host ("Shoutout doc: " + $shoutoutDocRel)
Write-Host ("Has STEP609 section: " + $has609)
Write-Host ("STEP609 batch: " + $batch609)
Write-Host ("STEP609 target: " + $target609)
Write-Host ("STEP609 modules: " + @($rows609).Count)
Write-Host ("STEP609 route hits: " + $hits609)
Write-Host ("Remaining real module-doc batches: " + @($remainingReal).Count)
Write-Host ("Remaining central ROUTES inventory batches: " + @($remainingRoutesOnly).Count)
Write-Host ("Remaining all batches: " + @($remainingAll).Count)
Write-Host ("Next batch: " + $nextBatchName)
Write-Host ("Next target: " + $nextTarget)
Write-Host ("Next modules: " + $nextModules)
Write-Host ("Next high-priority modules: " + $nextHigh)
Write-Host ("Next route hits: " + $nextHits)
Write-Host ("Next routes-only: " + $nextIsRoutesOnly)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Next rows TSV: " + $nextRowsTsv)
Write-Host ("Remaining real TSV: " + $remainingRealTsv)
Write-Host ("Remaining all TSV: " + $remainingAllTsv)
Write-Host ("Remaining ROUTES TSV: " + $remainingRoutesTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Shoutout doc: " + $shoutoutDocRel)
Write-Host ("Has STEP609 section: " + $has609)
Write-Host ("STEP609 batch: " + $batch609)
Write-Host ("STEP609 target: " + $target609)
Write-Host ("STEP609 modules: " + @($rows609).Count)
Write-Host ("STEP609 route hits: " + $hits609)
Write-Host ("Remaining real module-doc batches: " + @($remainingReal).Count)
Write-Host ("Remaining central ROUTES inventory batches: " + @($remainingRoutesOnly).Count)
Write-Host ("Remaining all batches: " + @($remainingAll).Count)
Write-Host ("Next batch: " + $nextBatchName)
Write-Host ("Next target: " + $nextTarget)
Write-Host ("Next modules: " + $nextModules)
Write-Host ("Next high-priority modules: " + $nextHigh)
Write-Host ("Next route hits: " + $nextHits)
Write-Host ("Next routes-only: " + $nextIsRoutesOnly)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
