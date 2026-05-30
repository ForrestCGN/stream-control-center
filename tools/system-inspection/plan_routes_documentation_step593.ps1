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

$routeAreaPath = Join-Path $OutDir "step592_missing_routes_by_area.tsv"
$moduleAreaPath = Join-Path $OutDir "step592_modules_no_matching_doc_by_area.tsv"
$topRoutesPath = Join-Path $OutDir "step592_top_missing_routes.tsv"
$topModulesPath = Join-Path $OutDir "step592_top_modules_with_routes_no_matching_doc.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($routeAreaPath,$moduleAreaPath,$topRoutesPath,$topModulesPath)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing STEP592 file: " + (Split-Path -Leaf $p))
  }
}

$routeAreas = @()
$moduleAreas = @()
$topRoutes = @()
$topModules = @()

if (Test-Path -LiteralPath $routeAreaPath) { $routeAreas = @(Import-Csv -LiteralPath $routeAreaPath -Delimiter "`t") }
if (Test-Path -LiteralPath $moduleAreaPath) { $moduleAreas = @(Import-Csv -LiteralPath $moduleAreaPath -Delimiter "`t") }
if (Test-Path -LiteralPath $topRoutesPath) { $topRoutes = @(Import-Csv -LiteralPath $topRoutesPath -Delimiter "`t") }
if (Test-Path -LiteralPath $topModulesPath) { $topModules = @(Import-Csv -LiteralPath $topModulesPath -Delimiter "`t") }

function IntVal {
  param($Value)
  $n = 0
  [int]::TryParse([string]$Value, [ref]$n) | Out-Null
  return $n
}

$areaTargets = @{
  "channelpoints" = [pscustomobject]@{
    primaryDoc = "docs/modules/channelpoints.md"
    supportDocs = "docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md"
    batch = "A"
    rationale = "Channelpoints has active feature state and dashboard/API integration."
  }
  "sound_media" = [pscustomobject]@{
    primaryDoc = "docs/modules/sound_system_channelpoints_routing.md"
    supportDocs = "docs/modules/media_asset_utf8_filename_cleanup.md"
    batch = "B"
    rationale = "Sound and media are central shared layers and must avoid accidental flow changes."
  }
  "alerts" = [pscustomobject]@{
    primaryDoc = "docs/current/CURRENT_SYSTEM_STATUS.md"
    supportDocs = "docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md"
    batch = "C"
    rationale = "Alert route docs should preserve direct overlay vs bus-shadow distinction."
  }
  "communication_bus" = [pscustomobject]@{
    primaryDoc = "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md"
    supportDocs = "docs/modules/README.md"
    batch = "D"
    rationale = "Communication Bus is contract-sensitive and should be documented from real routes."
  }
  "dashboard_admin_security" = [pscustomobject]@{
    primaryDoc = "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md"
    supportDocs = "docs/current/PROJECT_WORKING_RULES.md"
    batch = "E"
    rationale = "Dashboard must use backend APIs and security/admin routes need careful grouping."
  }
  "obs_overlay" = [pscustomobject]@{
    primaryDoc = "docs/current/CURRENT_SYSTEM_STATUS.md"
    supportDocs = "project-state/NEXT_STEPS.md"
    batch = "F"
    rationale = "Overlay/OBS route work is likely next health/refresh block."
  }
  "twitch_chat" = [pscustomobject]@{
    primaryDoc = "docs/current/CURRENT_SYSTEM_STATUS.md"
    supportDocs = "docs/modules/README.md"
    batch = "G"
    rationale = "Twitch/chat routes often support multiple features and need inventory before edits."
  }
  "discord_tagebuch_todo" = [pscustomobject]@{
    primaryDoc = "docs/modules/README.md"
    supportDocs = "docs/current/CURRENT_SYSTEM_STATUS.md"
    batch = "H"
    rationale = "Discord/Tagebuch/Todo route docs should preserve module boundaries."
  }
  "stream_features" = [pscustomobject]@{
    primaryDoc = "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md"
    supportDocs = "docs/modules/README.md"
    batch = "I"
    rationale = "Stream feature route docs should be grouped rather than many tiny docs."
  }
  "diagnostics" = [pscustomobject]@{
    primaryDoc = "docs/current/CURRENT_SYSTEM_STATUS.md"
    supportDocs = "docs/backend/ROUTES.md"
    batch = "J"
    rationale = "Diagnostics/status routes are best summarized centrally."
  }
  "other" = [pscustomobject]@{
    primaryDoc = "docs/backend/ROUTES.md"
    supportDocs = "docs/modules/README.md"
    batch = "Z"
    rationale = "Unclassified routes need manual review before assigning module docs."
  }
}

$allAreas = @{}
foreach ($r in $routeAreas) { $allAreas[[string]$r.area] = $true }
foreach ($m in $moduleAreas) { $allAreas[[string]$m.area] = $true }

$batchPlan = @()
foreach ($area in ($allAreas.Keys | Sort-Object)) {
  $target = $areaTargets[$area]
  if ($null -eq $target) { $target = $areaTargets["other"] }

  $routeRow = @($routeAreas | Where-Object { $_.area -eq $area } | Select-Object -First 1)
  $moduleRow = @($moduleAreas | Where-Object { $_.area -eq $area } | Select-Object -First 1)

  $missingRoutes = 0
  $highMissingRoutes = 0
  $modulesNoDoc = 0
  $highModules = 0
  $moduleRouteHits = 0

  if ($routeRow.Count -gt 0) {
    $missingRoutes = IntVal $routeRow[0].missingRoutes
    $highMissingRoutes = IntVal $routeRow[0].highPriority
  }
  if ($moduleRow.Count -gt 0) {
    $modulesNoDoc = IntVal $moduleRow[0].modulesWithRoutesNoMatchingDoc
    $highModules = IntVal $moduleRow[0].highPriority
    $moduleRouteHits = IntVal $moduleRow[0].totalRouteHits
  }

  $score = ($highMissingRoutes * 10) + ($missingRoutes * 3) + ($highModules * 4) + $modulesNoDoc + [Math]::Min($moduleRouteHits, 50)

  $recommendedStep = "manual_review"
  if ($missingRoutes -gt 0 -and $modulesNoDoc -gt 0) { $recommendedStep = "routes_inventory_then_module_docs" }
  elseif ($missingRoutes -gt 0) { $recommendedStep = "routes_inventory" }
  elseif ($modulesNoDoc -gt 0) { $recommendedStep = "module_doc_mapping_review" }

  $batchPlan += [pscustomobject]@{
    batch = $target.batch
    area = $area
    priorityScore = $score
    missingRoutes = $missingRoutes
    highPriorityMissingRoutes = $highMissingRoutes
    modulesWithRoutesNoMatchingDoc = $modulesNoDoc
    highPriorityModules = $highModules
    moduleRouteHits = $moduleRouteHits
    recommendedAction = $recommendedStep
    primaryDoc = $target.primaryDoc
    supportDocs = $target.supportDocs
    rationale = $target.rationale
  }
}

$batchPlan = @($batchPlan | Sort-Object @{Expression="priorityScore";Descending=$true}, batch, area)
$nextBatches = @($batchPlan | Where-Object { $_.priorityScore -gt 0 } | Select-Object -First 5)

$needsCentralRoutes = $true
$centralRoutesDoc = "docs/backend/ROUTES.md"
$centralPlanReason = "572 unique routes and 26 missing route doc mentions from STEP591 suggest a central route inventory before editing many module docs."

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step593_routes_documentation_consolidation_plan_summary.txt"
$planPath = Join-Path $OutDir "step593_routes_documentation_batch_plan.tsv"
$nextPath = Join-Path $OutDir "step593_recommended_next_batches.tsv"
$mdPlanPath = Join-Path $OutDir "step593_routes_documentation_consolidation_plan.md"
$jsonPath = Join-Path $OutDir "step593_routes_documentation_consolidation_plan.json"

$batchPlan | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $planPath -Encoding UTF8
$nextBatches | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $nextPath -Encoding UTF8

$totalMissingRoutes = 0
$totalModulesWithRoutesNoMatchingDoc = 0
if (@($routeAreas).Count -gt 0) {
  $totalMissingRoutes = (@($routeAreas | ForEach-Object { IntVal $_.missingRoutes }) | Measure-Object -Sum).Sum
}
if (@($moduleAreas).Count -gt 0) {
  $totalModulesWithRoutesNoMatchingDoc = (@($moduleAreas | ForEach-Object { IntVal $_.modulesWithRoutesNoMatchingDoc }) | Measure-Object -Sum).Sum
}

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    areasPlanned = @($batchPlan).Count
    recommendedNextBatches = @($nextBatches).Count
    needsCentralRoutesDoc = $needsCentralRoutes
    centralRoutesDoc = $centralRoutesDoc
    totalMissingRoutes = $totalMissingRoutes
    totalModulesWithRoutesNoMatchingDoc = $totalModulesWithRoutesNoMatchingDoc
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  batchPlan = $batchPlan
  recommendedNextBatches = $nextBatches
  centralRoutesDoc = $centralRoutesDoc
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = @()
$md += "# STEP593 Routes Documentation Consolidation Plan"
$md += ""
$md += "Generated: $timestamp"
$md += ""
$md += "## Ergebnis aus STEP591/STEP592"
$md += ""
$md += '```text'
$md += "Missing routes total: $totalMissingRoutes"
$md += "Modules with routes but no matching doc: $totalModulesWithRoutesNoMatchingDoc"
$md += "Areas planned: " + @($batchPlan).Count
$md += "Warnings: " + @($warnings).Count
$md += "Errors: " + @($errors).Count
$md += '```'
$md += ""
$md += "## Empfehlung"
$md += ""
$md += "Nicht blind 45 neue Modul-Dokus erzeugen."
$md += ""
$md += "Stattdessen zuerst eine zentrale Routen-Inventur anlegen:"
$md += ""
$md += '```text'
$md += $centralRoutesDoc
$md += '```'
$md += ""
$md += $centralPlanReason
$md += ""
$md += "## Priorisierte Batches"
$md += ""
foreach ($b in $batchPlan) {
  $md += "### Batch " + $b.batch + " - " + $b.area
  $md += ""
  $md += '```text'
  $md += "Priority score: " + $b.priorityScore
  $md += "Missing routes: " + $b.missingRoutes
  $md += "High-priority missing routes: " + $b.highPriorityMissingRoutes
  $md += "Modules with routes but no matching doc: " + $b.modulesWithRoutesNoMatchingDoc
  $md += "High-priority modules: " + $b.highPriorityModules
  $md += "Module route hits: " + $b.moduleRouteHits
  $md += "Recommended action: " + $b.recommendedAction
  $md += "Primary doc: " + $b.primaryDoc
  $md += "Support docs: " + $b.supportDocs
  $md += '```'
  $md += ""
  $md += $b.rationale
  $md += ""
}
$md += "## Nächster STEP"
$md += ""
$md += '```text'
$md += "STEP594 - Central Routes Inventory Draft"
$md += '```'
$md += ""
$md += "Ziel: docs/backend/ROUTES.md aus echten STEP591-Treffern erstellen, mit Warnhinweis, dass Regex-Treffer vor produktiven Entscheidungen geprüft werden müssen."
($md -join "`n") | Out-File -FilePath $mdPlanPath -Encoding UTF8

$summary = @()
$summary += "STEP593 Routes Documentation Consolidation Plan Summary"
$summary += "Generated: " + $timestamp
$summary += "Areas planned: " + @($batchPlan).Count
$summary += "Recommended next batches: " + @($nextBatches).Count
$summary += "Needs central routes doc: " + $needsCentralRoutes
$summary += "Central routes doc: " + $centralRoutesDoc
$summary += "Total missing routes: " + $totalMissingRoutes
$summary += "Total modules with routes but no matching doc: " + $totalModulesWithRoutesNoMatchingDoc
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Recommended next batches:"
foreach ($b in $nextBatches) {
  $summary += ("- Batch " + $b.batch + " / " + $b.area + " | score=" + $b.priorityScore + " | action=" + $b.recommendedAction + " | primary=" + $b.primaryDoc)
}
$summary += ""
$summary += "Next STEP:"
$summary += "STEP594 - Central Routes Inventory Draft"
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
Write-Host "STEP593 Routes Documentation Consolidation Plan fertig."
Write-Host ("Areas planned: " + @($batchPlan).Count)
Write-Host ("Recommended next batches: " + @($nextBatches).Count)
Write-Host ("Needs central routes doc: " + $needsCentralRoutes)
Write-Host ("Central routes doc: " + $centralRoutesDoc)
Write-Host ("Total missing routes: " + $totalMissingRoutes)
Write-Host ("Total modules with routes but no matching doc: " + $totalModulesWithRoutesNoMatchingDoc)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Batch plan TSV: " + $planPath)
Write-Host ("Next batches TSV: " + $nextPath)
Write-Host ("Markdown plan: " + $mdPlanPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Areas planned: " + @($batchPlan).Count)
Write-Host ("Recommended next batches: " + @($nextBatches).Count)
Write-Host ("Needs central routes doc: " + $needsCentralRoutes)
Write-Host ("Central routes doc: " + $centralRoutesDoc)
Write-Host ("Total missing routes: " + $totalMissingRoutes)
Write-Host ("Total modules with routes but no matching doc: " + $totalModulesWithRoutesNoMatchingDoc)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
