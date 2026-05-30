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

$modulePlanTsv = Join-Path $OutDir "step595_module_doc_update_plan.tsv"
$docTargetsTsv = Join-Path $OutDir "step595_doc_target_summary.tsv"
$routesDocRel = "docs/backend/ROUTES.md"

$errors = @()
$warnings = @()

foreach ($p in @($modulePlanTsv,$docTargetsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$modulePlan = @()
$docTargets = @()

if (Test-Path -LiteralPath $modulePlanTsv) { $modulePlan = @(Import-Csv -LiteralPath $modulePlanTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $docTargetsTsv) { $docTargets = @(Import-Csv -LiteralPath $docTargetsTsv -Delimiter "`t") }

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

function Get-BatchName {
  param([string]$Target)
  $s = $Target.ToLowerInvariant()
  if ($s -match "channelpoints") { return "A_channelpoints" }
  if ($s -match "sound") { return "B_sound_media" }
  if ($s -match "communication") { return "C_communication_bus" }
  if ($s -match "dashboard") { return "D_dashboard_commands" }
  if ($s -match "shoutout") { return "E_shoutout_clip_features" }
  if ($s -match "current_system_status") { return "F_current_status_crossmodule" }
  return "Z_backend_routes_inventory"
}

$batchRows = @()
foreach ($m in $modulePlan) {
  $target = [string]$m.proposedDocTarget
  $batch = Get-BatchName $target
  $routeHits = IntVal $m.routeHitCount
  $priority = [string]$m.priority

  $action = "review_existing_doc_section"
  if ($target -eq $routesDocRel) { $action = "keep_in_routes_inventory_until_verified" }
  elseif ($priority -eq "high") { $action = "update_target_doc_first" }
  elseif ($priority -eq "review") { $action = "manual_mapping_review" }

  $batchRows += [pscustomobject]@{
    batch = $batch
    priority = $priority
    module = $m.module
    file = $m.file
    routeHitCount = $routeHits
    proposedDocTarget = $target
    recommendedAction = $action
  }
}

$batchSummary = @(
  $batchRows |
    Group-Object batch |
    Sort-Object Name |
    ForEach-Object {
      [pscustomobject]@{
        batch = $_.Name
        modules = $_.Count
        highPriority = @($_.Group | Where-Object { $_.priority -eq "high" }).Count
        reviewPriority = @($_.Group | Where-Object { $_.priority -eq "review" }).Count
        totalRouteHits = (@($_.Group | Measure-Object routeHitCount -Sum).Sum)
        primaryTarget = (@($_.Group | Select-Object -ExpandProperty proposedDocTarget -Unique) -join ", ")
      }
    }
)

$orderedBatches = @(
  $batchSummary |
    Sort-Object @{Expression="highPriority";Descending=$true}, @{Expression="totalRouteHits";Descending=$true}, batch
)

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step598_module_route_docs_batch_plan_summary.txt"
$batchRowsTsv = Join-Path $OutDir "step598_module_route_docs_batch_rows.tsv"
$batchSummaryTsv = Join-Path $OutDir "step598_module_route_docs_batch_summary.tsv"
$mdPlanPath = Join-Path $OutDir "step598_module_route_docs_batch_plan.md"
$jsonPath = Join-Path $OutDir "step598_module_route_docs_batch_plan.json"

$batchRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $batchRowsTsv -Encoding UTF8
$batchSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $batchSummaryTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    moduleCandidates = @($modulePlan).Count
    docTargets = @($docTargets).Count
    batches = @($batchSummary).Count
    highPriorityModules = @($batchRows | Where-Object { $_.priority -eq "high" }).Count
    reviewPriorityModules = @($batchRows | Where-Object { $_.priority -eq "review" }).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  batchSummary = $batchSummary
  orderedBatches = $orderedBatches
  batchRows = $batchRows
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP598 Module Route Docs Batch Plan")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ziel")
$md.Add("")
$md.Add("Die 45 Modul-Doku-Kandidaten aus STEP595 in kleine sinnvolle Batches gruppieren.")
$md.Add("")
$md.Add("Dieser STEP aendert keine Modul-Dokus.")
$md.Add("")
$md.Add("## Summary")
$md.Add("")
$md.Add("Module candidates: " + @($modulePlan).Count)
$md.Add("Doc targets: " + @($docTargets).Count)
$md.Add("Batches: " + @($batchSummary).Count)
$md.Add("High-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "high" }).Count)
$md.Add("Review-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "review" }).Count)
$md.Add("Warnings: " + @($warnings).Count)
$md.Add("Errors: " + @($errors).Count)
$md.Add("")
$md.Add("## Batch-Reihenfolge")
$md.Add("")
$md.Add("| Batch | Module | High | Review | Route Hits | Primary Target |")
$md.Add("|---|---:|---:|---:|---:|---|")
foreach ($b in $orderedBatches) {
  $md.Add("| " + (Escape-MdCell $b.batch) + " | " + $b.modules + " | " + $b.highPriority + " | " + $b.reviewPriority + " | " + $b.totalRouteHits + " | " + (Escape-MdCell $b.primaryTarget) + " |")
}
$md.Add("")
$md.Add("## Detail-Batches")
$md.Add("")
foreach ($batch in ($orderedBatches | Select-Object -ExpandProperty batch)) {
  $rows = @($batchRows | Where-Object { $_.batch -eq $batch } | Sort-Object priority,module)
  $md.Add("### " + $batch)
  $md.Add("")
  $md.Add("| Priority | Module | File | Route Hits | Target | Action |")
  $md.Add("|---|---|---|---:|---|---|")
  foreach ($r in $rows) {
    $md.Add("| " + (Escape-MdCell $r.priority) + " | " + (Escape-MdCell $r.module) + " | " + (Escape-MdCell $r.file) + " | " + $r.routeHitCount + " | " + (Escape-MdCell $r.proposedDocTarget) + " | " + (Escape-MdCell $r.recommendedAction) + " |")
  }
  $md.Add("")
}
$md.Add("## Empfohlene Umsetzung")
$md.Add("")
$md.Add("1. Pro Batch genau eine Ziel-Doku anfassen.")
$md.Add("2. Keine neuen Einzel-Dokus pro Modul erzeugen, solange ein passender Sammelabschnitt reicht.")
$md.Add("3. Kandidaten mit Priority review erst manuell mappen.")
$md.Add("4. Nach jedem Doku-Batch aktuellen Status und NEXT_STEPS aktualisieren.")
$md.Add("")
$md.Add("## Naechster STEP")
$md.Add("")
$md.Add("STEP599 - Module Route Docs Batch A")
$md.Add("")
$md.Add("Ziel: den hoechstpriorisierten Batch aus diesem Plan als ersten echten Modul-Doku-Batch umsetzen.")
($md -join "`n") | Out-File -FilePath $mdPlanPath -Encoding UTF8

$summary = @()
$summary += "STEP598 Module Route Docs Batch Plan Summary"
$summary += "Generated: " + $timestamp
$summary += "Module candidates: " + @($modulePlan).Count
$summary += "Doc targets: " + @($docTargets).Count
$summary += "Batches: " + @($batchSummary).Count
$summary += "High-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "high" }).Count
$summary += "Review-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "review" }).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Batch order:"
foreach ($b in $orderedBatches) {
  $summary += ("- " + $b.batch + " | modules=" + $b.modules + " | high=" + $b.highPriority + " | review=" + $b.reviewPriority + " | routeHits=" + $b.totalRouteHits + " | target=" + $b.primaryTarget)
}
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
Write-Host "STEP598 Module Route Docs Batch Plan fertig."
Write-Host ("Module candidates: " + @($modulePlan).Count)
Write-Host ("Doc targets: " + @($docTargets).Count)
Write-Host ("Batches: " + @($batchSummary).Count)
Write-Host ("High-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "high" }).Count)
Write-Host ("Review-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "review" }).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Batch rows TSV: " + $batchRowsTsv)
Write-Host ("Batch summary TSV: " + $batchSummaryTsv)
Write-Host ("Markdown plan: " + $mdPlanPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Module candidates: " + @($modulePlan).Count)
Write-Host ("Doc targets: " + @($docTargets).Count)
Write-Host ("Batches: " + @($batchSummary).Count)
Write-Host ("High-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "high" }).Count)
Write-Host ("Review-priority modules: " + @($batchRows | Where-Object { $_.priority -eq "review" }).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
