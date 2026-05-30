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
$inventoryTsv = Join-Path $OutDir "step594_central_routes_inventory.tsv"
$areaSummaryTsv = Join-Path $OutDir "step594_routes_area_summary.tsv"
$missingTsv = Join-Path $OutDir "step591_routes_missing_doc_mentions.tsv"
$moduleStatusTsv = Join-Path $OutDir "step591_module_doc_status.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($routesDocPath,$inventoryTsv,$areaSummaryTsv,$missingTsv,$moduleStatusTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$inventory = @()
$areas = @()
$missing = @()
$moduleStatus = @()

if (Test-Path -LiteralPath $inventoryTsv) { $inventory = @(Import-Csv -LiteralPath $inventoryTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $areaSummaryTsv) { $areas = @(Import-Csv -LiteralPath $areaSummaryTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $missingTsv) { $missing = @(Import-Csv -LiteralPath $missingTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $moduleStatusTsv) { $moduleStatus = @(Import-Csv -LiteralPath $moduleStatusTsv -Delimiter "`t") }

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

# Potential false-positive markers based on route/raw characteristics.
$reviewRows = @()
foreach ($r in $inventory) {
  $route = [string]$r.route
  $files = [string]$r.files
  $methods = [string]$r.methods
  $area = [string]$r.area
  $hitCount = IntVal $r.hitCount
  $missingDoc = ([string]$r.missingDocMention).ToLowerInvariant() -eq "true"

  $risk = "normal"
  $note = "manual review"

  if ($route -match "\$\{|:\w+|\*|\+|\\") {
    $risk = "dynamic_or_pattern"
    $note = "Route contains dynamic/pattern-like tokens; verify in source."
  }
  elseif ($methods -match "UNKNOWN" -or [string]::IsNullOrWhiteSpace($methods)) {
    $risk = "unknown_method"
    $note = "Method not clearly detected; verify whether this is a real route."
  }
  elseif ($route -notmatch "^/") {
    $risk = "not_absolute"
    $note = "Route does not start with slash; likely fragment or false positive."
  }
  elseif ($hitCount -gt 8) {
    $risk = "many_hits"
    $note = "Many hits for same route; could be reused constant or repeated mention."
  }
  elseif ($route -match "example|placeholder|todo") {
    $risk = "possible_example"
    $note = "Looks like example/placeholder; verify before documenting as real."
  }
  elseif ($missingDoc) {
    $risk = "doc_gap"
    $note = "Route is missing doc mention and should be checked first."
  }

  $priority = "normal"
  if ($missingDoc -and $risk -ne "possible_example" -and $risk -ne "not_absolute") { $priority = "high" }
  if ($risk -eq "dynamic_or_pattern" -or $risk -eq "unknown_method") { $priority = "review" }
  if ($area -eq "dashboard_admin_security" -or $area -eq "communication_bus") {
    if ($priority -eq "normal") { $priority = "review" }
  }

  $reviewRows += [pscustomobject]@{
    priority = $priority
    area = $area
    risk = $risk
    route = $route
    methods = $methods
    files = $files
    hitCount = $hitCount
    missingDocMention = $missingDoc
    note = $note
  }
}

$missingReview = @($reviewRows | Where-Object { $_.missingDocMention } | Sort-Object priority,area,route)
$falsePositiveCandidates = @($reviewRows | Where-Object { $_.risk -in @("dynamic_or_pattern","unknown_method","not_absolute","possible_example","many_hits") } | Sort-Object risk,area,route)

$modulesWithRoutesNoDoc = @($moduleStatus | Where-Object {
  $count = IntVal $_.routeHitCount
  $hasDoc = ([string]$_.hasMatchingDoc).ToLowerInvariant() -eq "true"
  $count -gt 0 -and -not $hasDoc
})

# Group module doc candidates by coarse target doc strategy.
function Get-DocTarget {
  param([string]$Module, [string]$File)
  $s = (($Module + " " + $File).ToLowerInvariant())
  if ($s -match "channelpoints") { return "docs/modules/channelpoints.md" }
  if ($s -match "sound|media|tts|vip") { return "docs/modules/sound_system_channelpoints_routing.md" }
  if ($s -match "alert|kofi|tipee") { return "docs/current/CURRENT_SYSTEM_STATUS.md" }
  if ($s -match "communication|bus") { return "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md" }
  if ($s -match "dashboard|auth|security") { return "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md" }
  if ($s -match "obs|scene|overlay") { return "docs/current/CURRENT_SYSTEM_STATUS.md" }
  if ($s -match "clip|shoutout") { return "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md" }
  return "docs/backend/ROUTES.md"
}

$modulePlanRows = @()
foreach ($m in $modulesWithRoutesNoDoc) {
  $target = Get-DocTarget -Module $m.module -File $m.file
  $routeHits = IntVal $m.routeHitCount
  $priority = "normal"
  if ($routeHits -ge 10) { $priority = "high" }
  if ([string]$m.file -match "helper|shared|core") { $priority = "review" }

  $modulePlanRows += [pscustomobject]@{
    priority = $priority
    module = $m.module
    file = $m.file
    routeHitCount = $routeHits
    proposedDocTarget = $target
    action = "map_existing_doc_or_create_section"
  }
}

$docTargetSummary = @(
  $modulePlanRows |
    Group-Object proposedDocTarget |
    Sort-Object Count -Descending |
    ForEach-Object {
      [pscustomobject]@{
        docTarget = $_.Name
        modules = $_.Count
        highPriorityModules = @($_.Group | Where-Object { $_.priority -eq "high" }).Count
        totalRouteHits = (@($_.Group | Measure-Object routeHitCount -Sum).Sum)
      }
    }
)

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step595_routes_inventory_review_plan_summary.txt"
$missingReviewTsv = Join-Path $OutDir "step595_missing_routes_review.tsv"
$fpTsv = Join-Path $OutDir "step595_false_positive_candidates.tsv"
$modulePlanTsv = Join-Path $OutDir "step595_module_doc_update_plan.tsv"
$docTargetsTsv = Join-Path $OutDir "step595_doc_target_summary.tsv"
$mdPlanPath = Join-Path $OutDir "step595_routes_inventory_review_plan.md"
$jsonPath = Join-Path $OutDir "step595_routes_inventory_review_plan.json"

$missingReview | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $missingReviewTsv -Encoding UTF8
$falsePositiveCandidates | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $fpTsv -Encoding UTF8
$modulePlanRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $modulePlanTsv -Encoding UTF8
$docTargetSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $docTargetsTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    routesInventoryRows = @($inventory).Count
    missingRoutesToReview = @($missingReview).Count
    falsePositiveCandidates = @($falsePositiveCandidates).Count
    moduleDocPlanRows = @($modulePlanRows).Count
    docTargets = @($docTargetSummary).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  missingRoutesReview = $missingReview
  falsePositiveCandidates = $falsePositiveCandidates
  moduleDocUpdatePlan = $modulePlanRows
  docTargetSummary = $docTargetSummary
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP595 Routes Inventory Review and Docs Update Plan")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ziel")
$md.Add("")
$md.Add("Die scanbasierte Routen-Inventur aus STEP594 fachlich vorbereiten, bevor Modul-Dokus angepasst werden.")
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Routes inventory rows: " + @($inventory).Count)
$md.Add("Missing routes to review: " + @($missingReview).Count)
$md.Add("False-positive candidates: " + @($falsePositiveCandidates).Count)
$md.Add("Module doc plan rows: " + @($modulePlanRows).Count)
$md.Add("Doc targets: " + @($docTargetSummary).Count)
$md.Add("Warnings: " + @($warnings).Count)
$md.Add("Errors: " + @($errors).Count)
$md.Add("")
$md.Add("## Empfehlung")
$md.Add("")
$md.Add("1. Zuerst fehlende Routen-Doku-Erwaehnungen pruefen.")
$md.Add("2. Danach offensichtliche False-Positive-Kandidaten markieren.")
$md.Add("3. Erst dann Modul-Dokus gezielt nachziehen.")
$md.Add("4. Nicht blind 45 Modul-Dokus erzeugen.")
$md.Add("")
$md.Add("## Ziel-Dokumente fuer Modul-Doku-Updates")
$md.Add("")
$md.Add("| Ziel-Doku | Module | High Priority | Route Hits |")
$md.Add("|---|---:|---:|---:|")
foreach ($d in $docTargetSummary) {
  $md.Add("| " + (Escape-MdCell $d.docTarget) + " | " + $d.modules + " | " + $d.highPriorityModules + " | " + $d.totalRouteHits + " |")
}
$md.Add("")
$md.Add("## Fehlende Routen-Doku-Erwaehnungen")
$md.Add("")
$md.Add("| Priority | Area | Risk | Route | Methods | Files | Note |")
$md.Add("|---|---|---|---|---|---|---|")
foreach ($r in ($missingReview | Select-Object -First 60)) {
  $filesShort = [string]$r.files
  if ($filesShort.Length -gt 120) { $filesShort = $filesShort.Substring(0,117) + "..." }
  $md.Add("| " + (Escape-MdCell $r.priority) + " | " + (Escape-MdCell $r.area) + " | " + (Escape-MdCell $r.risk) + " | " + (Escape-MdCell $r.route) + " | " + (Escape-MdCell $r.methods) + " | " + (Escape-MdCell $filesShort) + " | " + (Escape-MdCell $r.note) + " |")
}
$md.Add("")
$md.Add("## Naechster STEP")
$md.Add("")
$md.Add("STEP596 - Missing Routes Documentation Batch")
$md.Add("")
$md.Add("Ziel: Die 26 fehlenden Routen-Erwaehnungen als ersten echten Doku-Batch in docs/backend/ROUTES.md und ggf. betroffenen Konsolidierungsdokus markieren.")
($md -join "`n") | Out-File -FilePath $mdPlanPath -Encoding UTF8

$summary = @()
$summary += "STEP595 Routes Inventory Review Plan Summary"
$summary += "Generated: " + $timestamp
$summary += "Routes inventory rows: " + @($inventory).Count
$summary += "Missing routes to review: " + @($missingReview).Count
$summary += "False-positive candidates: " + @($falsePositiveCandidates).Count
$summary += "Module doc plan rows: " + @($modulePlanRows).Count
$summary += "Doc targets: " + @($docTargetSummary).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Top doc targets:"
foreach ($d in ($docTargetSummary | Select-Object -First 10)) {
  $summary += ("- " + $d.docTarget + " | modules=" + $d.modules + " | high=" + $d.highPriorityModules + " | routeHits=" + $d.totalRouteHits)
}
$summary += ""
$summary += "Next STEP:"
$summary += "STEP596 - Missing Routes Documentation Batch"
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
Write-Host "STEP595 Routes Inventory Review and Docs Update Plan fertig."
Write-Host ("Routes inventory rows: " + @($inventory).Count)
Write-Host ("Missing routes to review: " + @($missingReview).Count)
Write-Host ("False-positive candidates: " + @($falsePositiveCandidates).Count)
Write-Host ("Module doc plan rows: " + @($modulePlanRows).Count)
Write-Host ("Doc targets: " + @($docTargetSummary).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Missing routes review TSV: " + $missingReviewTsv)
Write-Host ("False positives TSV: " + $fpTsv)
Write-Host ("Module doc plan TSV: " + $modulePlanTsv)
Write-Host ("Doc targets TSV: " + $docTargetsTsv)
Write-Host ("Markdown plan: " + $mdPlanPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Routes inventory rows: " + @($inventory).Count)
Write-Host ("Missing routes to review: " + @($missingReview).Count)
Write-Host ("False-positive candidates: " + @($falsePositiveCandidates).Count)
Write-Host ("Module doc plan rows: " + @($modulePlanRows).Count)
Write-Host ("Doc targets: " + @($docTargetSummary).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
