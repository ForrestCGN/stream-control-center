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

$errors = @()
$warnings = @()

$expectedDocs = @(
  @{
    name = "Central Routes Inventory"
    path = "docs/backend/ROUTES.md"
    markers = @(
      "<!-- STEP596_MISSING_ROUTES_DOCS_START -->",
      "<!-- STEP596_MISSING_ROUTES_DOCS_END -->",
      "<!-- STEP597_ROUTE_FALSE_POSITIVE_REVIEW_START -->",
      "<!-- STEP597_ROUTE_FALSE_POSITIVE_REVIEW_END -->",
      "<!-- STEP599_MODULE_ROUTE_DOCS_BATCH_A_START -->",
      "<!-- STEP599_MODULE_ROUTE_DOCS_BATCH_A_END -->"
    )
  },
  @{
    name = "Current Status Crossmodule"
    path = "docs/current/CURRENT_SYSTEM_STATUS.md"
    markers = @(
      "<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_START -->",
      "<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_END -->"
    )
  },
  @{
    name = "Channelpoints"
    path = "docs/modules/channelpoints.md"
    markers = @(
      "<!-- STEP603A_CHANNELPOINTS_MODULE_DOCS_BATCH_START -->",
      "<!-- STEP603A_CHANNELPOINTS_MODULE_DOCS_BATCH_END -->"
    )
  },
  @{
    name = "Sound System Channelpoints Routing"
    path = "docs/modules/sound_system_channelpoints_routing.md"
    markers = @(
      "<!-- STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH_START -->",
      "<!-- STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH_END -->"
    )
  },
  @{
    name = "Dashboard Commands"
    path = "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md"
    markers = @(
      "<!-- STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH_START -->",
      "<!-- STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH_END -->"
    )
  },
  @{
    name = "Communication Bus Contract"
    path = "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md"
    markers = @(
      "<!-- STEP607_COMMUNICATION_BUS_CONTRACT_BATCH_START -->",
      "<!-- STEP607_COMMUNICATION_BUS_CONTRACT_BATCH_END -->"
    )
  },
  @{
    name = "Shoutout System"
    path = "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md"
    markers = @(
      "<!-- STEP609_SHOUTOUT_CLIP_FEATURES_DOCS_BATCH_START -->",
      "<!-- STEP609_SHOUTOUT_CLIP_FEATURES_DOCS_BATCH_END -->"
    )
  }
)

$requiredReports = @(
  "step591_routes_module_docs_verification_summary.txt",
  "step592_routes_scan_results_triage_summary.txt",
  "step593_routes_documentation_plan_summary.txt",
  "step594_central_routes_inventory_summary.txt",
  "step595_routes_inventory_review_summary.txt",
  "step596_missing_routes_docs_summary.txt",
  "step597_route_false_positive_review_summary.txt",
  "step598_module_route_docs_batch_plan_summary.txt",
  "step599_module_route_docs_batch_a_summary.txt",
  "step600_module_route_docs_batch_a_verification_summary.txt",
  "step601_current_status_crossmodule_batch_summary.txt",
  "step602_current_status_crossmodule_batch_verification_summary.txt",
  "step603a_channelpoints_module_docs_batch_summary.txt",
  "step603b_sound_system_routing_docs_batch_summary.txt",
  "step604_channelpoints_sound_routing_verification_summary.txt",
  "step605_dashboard_commands_module_docs_batch_summary.txt",
  "step606_dashboard_commands_batch_verification_summary.txt",
  "step607_communication_bus_contract_docs_batch_summary.txt",
  "step608_communication_bus_batch_verification_summary.txt",
  "step609_shoutout_clip_features_docs_batch_summary.txt",
  "step610_shoutout_clip_features_batch_verification_summary.txt"
)

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

$docChecks = @()
foreach ($d in $expectedDocs) {
  $rel = [string]$d.path
  $full = Join-Path $ProjectRoot ($rel.Replace("/", "\"))
  $exists = Test-Path -LiteralPath $full
  $missingMarkers = @()
  if ($exists) {
    $content = Get-Content -LiteralPath $full -Raw -Encoding UTF8
    foreach ($m in $d.markers) {
      if (-not $content.Contains($m)) {
        $missingMarkers += $m
      }
    }
  } else {
    $errors += "Missing expected doc: " + $rel
    $missingMarkers = @($d.markers)
  }

  if (@($missingMarkers).Count -gt 0) {
    $warnings += ("Missing markers in " + $rel + ": " + (@($missingMarkers) -join ", "))
  }

  $docChecks += [pscustomobject]@{
    name = [string]$d.name
    path = $rel
    exists = $exists
    markerCount = @($d.markers).Count
    missingMarkerCount = @($missingMarkers).Count
    missingMarkers = (@($missingMarkers) -join "; ")
  }
}

$reportChecks = @()
foreach ($r in $requiredReports) {
  $full = Join-Path $OutDir $r
  $exists = Test-Path -LiteralPath $full
  if (-not $exists) {
    $warnings += "Missing expected report: " + $r
  }
  $reportChecks += [pscustomobject]@{
    file = $r
    exists = $exists
  }
}

$step610Json = Join-Path $OutDir "step610_shoutout_clip_features_batch_verification.json"
$remainingReal = $null
$remainingRoutes = $null
$remainingAll = $null
$step610Ok = $false

if (Test-Path -LiteralPath $step610Json) {
  try {
    $step610 = Get-Content -LiteralPath $step610Json -Raw -Encoding UTF8 | ConvertFrom-Json
    $remainingReal = IntVal $step610.summary.remainingRealBatches
    $remainingRoutes = IntVal $step610.summary.remainingRoutesInventoryBatches
    $remainingAll = IntVal $step610.summary.remainingAllBatches
    $step610Ok = ($remainingReal -eq 0 -and $remainingRoutes -eq 0 -and $remainingAll -eq 0 -and (IntVal $step610.summary.errors) -eq 0)
  } catch {
    $warnings += "Could not parse step610 JSON: " + $_.Exception.Message
  }
} else {
  $warnings += "Missing step610 verification JSON."
}

$allDocsHaveMarkers = (@($docChecks | Where-Object { $_.missingMarkerCount -gt 0 -or -not $_.exists }).Count -eq 0)
$allReportsExist = (@($reportChecks | Where-Object { -not $_.exists }).Count -eq 0)

$completionOk = ($allDocsHaveMarkers -and $step610Ok -and (@($errors).Count -eq 0))

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step611_final_module_route_docs_completion_summary.txt"
$docChecksTsv = Join-Path $OutDir "step611_doc_marker_checks.tsv"
$reportChecksTsv = Join-Path $OutDir "step611_required_report_checks.tsv"
$mdPath = Join-Path $OutDir "step611_final_module_route_docs_completion.md"
$jsonPath = Join-Path $OutDir "step611_final_module_route_docs_completion.json"

$docChecks | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $docChecksTsv -Encoding UTF8
$reportChecks | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $reportChecksTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    docsChecked = @($docChecks).Count
    docsWithMissingMarkers = @($docChecks | Where-Object { $_.missingMarkerCount -gt 0 -or -not $_.exists }).Count
    reportsChecked = @($reportChecks).Count
    reportsMissing = @($reportChecks | Where-Object { -not $_.exists }).Count
    step610RemainingRealBatches = $remainingReal
    step610RemainingRoutesInventoryBatches = $remainingRoutes
    step610RemainingAllBatches = $remainingAll
    allDocsHaveMarkers = $allDocsHaveMarkers
    allRequiredReportsExist = $allReportsExist
    completionOk = $completionOk
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  docChecks = $docChecks
  reportChecks = $reportChecks
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP611 Final Module Route Docs Completion Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Completion OK: " + $completionOk)
$md.Add("Docs checked: " + @($docChecks).Count)
$md.Add("Docs with missing markers: " + @($docChecks | Where-Object { $_.missingMarkerCount -gt 0 -or -not $_.exists }).Count)
$md.Add("Reports checked: " + @($reportChecks).Count)
$md.Add("Reports missing: " + @($reportChecks | Where-Object { -not $_.exists }).Count)
$md.Add("")
$md.Add("## STEP610 Reststatus")
$md.Add("")
$md.Add("Remaining real module-doc batches: " + $remainingReal)
$md.Add("Remaining central ROUTES inventory batches: " + $remainingRoutes)
$md.Add("Remaining all batches: " + $remainingAll)
$md.Add("")
$md.Add("## Doku-Marker-Pruefung")
$md.Add("")
$md.Add("| Doc | Exists | Missing markers |")
$md.Add("|---|---:|---:|")
foreach ($d in $docChecks) {
  $md.Add("| " + (Escape-MdCell $d.path) + " | " + $d.exists + " | " + $d.missingMarkerCount + " |")
}
$md.Add("")
$md.Add("## Abschluss")
$md.Add("")
if ($completionOk) {
  $md.Add("Die Modul-/Routen-Doku-Batch-Reihe STEP591 bis STEP610 ist abgeschlossen.")
  $md.Add("")
  $md.Add("Empfohlener Folge-Step: STEP612 - Central Status Files Update nach Route-Docs-Abschluss.")
} else {
  $md.Add("Die Abschlusspruefung ist noch nicht sauber. Bitte Warnings/Errors pruefen.")
}
$md.Add("")
$md.Add("## Naechster sinnvoller Schritt")
$md.Add("")
$md.Add("STEP612 - Central Status Files Update")
$md.Add("")
$md.Add("Ziel: CURRENT_STATUS, NEXT_STEPS, CHANGELOG und ggf. FILES mit dem Abschluss der Routen-/Modul-Doku-Konsolidierung aktualisieren.")
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP611 Final Module Route Docs Completion Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "Docs checked: " + @($docChecks).Count
$summary += "Docs with missing markers: " + @($docChecks | Where-Object { $_.missingMarkerCount -gt 0 -or -not $_.exists }).Count
$summary += "Reports checked: " + @($reportChecks).Count
$summary += "Reports missing: " + @($reportChecks | Where-Object { -not $_.exists }).Count
$summary += "STEP610 remaining real module-doc batches: " + $remainingReal
$summary += "STEP610 remaining central ROUTES inventory batches: " + $remainingRoutes
$summary += "STEP610 remaining all batches: " + $remainingAll
$summary += "All docs have markers: " + $allDocsHaveMarkers
$summary += "All required reports exist: " + $allReportsExist
$summary += "Completion OK: " + $completionOk
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
Write-Host "STEP611 Final Module Route Docs Completion Verification fertig."
Write-Host ("Docs checked: " + @($docChecks).Count)
Write-Host ("Docs with missing markers: " + @($docChecks | Where-Object { $_.missingMarkerCount -gt 0 -or -not $_.exists }).Count)
Write-Host ("Reports checked: " + @($reportChecks).Count)
Write-Host ("Reports missing: " + @($reportChecks | Where-Object { -not $_.exists }).Count)
Write-Host ("STEP610 remaining real module-doc batches: " + $remainingReal)
Write-Host ("STEP610 remaining central ROUTES inventory batches: " + $remainingRoutes)
Write-Host ("STEP610 remaining all batches: " + $remainingAll)
Write-Host ("All docs have markers: " + $allDocsHaveMarkers)
Write-Host ("All required reports exist: " + $allReportsExist)
Write-Host ("Completion OK: " + $completionOk)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Doc checks TSV: " + $docChecksTsv)
Write-Host ("Report checks TSV: " + $reportChecksTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Docs checked: " + @($docChecks).Count)
Write-Host ("Docs with missing markers: " + @($docChecks | Where-Object { $_.missingMarkerCount -gt 0 -or -not $_.exists }).Count)
Write-Host ("Reports checked: " + @($reportChecks).Count)
Write-Host ("Reports missing: " + @($reportChecks | Where-Object { -not $_.exists }).Count)
Write-Host ("STEP610 remaining real module-doc batches: " + $remainingReal)
Write-Host ("STEP610 remaining central ROUTES inventory batches: " + $remainingRoutes)
Write-Host ("STEP610 remaining all batches: " + $remainingAll)
Write-Host ("All docs have markers: " + $allDocsHaveMarkers)
Write-Host ("All required reports exist: " + $allReportsExist)
Write-Host ("Completion OK: " + $completionOk)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
