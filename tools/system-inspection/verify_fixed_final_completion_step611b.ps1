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
    markerGroups = @(
      @("<!-- STEP596_MISSING_ROUTES_DOCS_START -->","<!-- STEP596_MISSING_ROUTES_DOCUMENTATION_BATCH_START -->","STEP596 Missing Routes Documentation Batch","STEP596"),
      @("<!-- STEP597_ROUTE_FALSE_POSITIVE_REVIEW_START -->","<!-- STEP597_FALSE_POSITIVE_REVIEW_START -->","STEP597 False Positive Review","STEP597"),
      @("<!-- STEP599_MODULE_ROUTE_DOCS_BATCH_A_START -->","STEP599 Module Route Docs Batch A","STEP599")
    )
  },
  @{
    name = "Current Status Crossmodule"
    path = "docs/current/CURRENT_SYSTEM_STATUS.md"
    markerGroups = @(
      @("<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_START -->","STEP601 Current Status Crossmodule","STEP601")
    )
  },
  @{
    name = "Channelpoints"
    path = "docs/modules/channelpoints.md"
    markerGroups = @(
      @("<!-- STEP603A_CHANNELPOINTS_MODULE_DOCS_BATCH_START -->","STEP603A Channelpoints Module Docs Batch","STEP603A")
    )
  },
  @{
    name = "Sound System Channelpoints Routing"
    path = "docs/modules/sound_system_channelpoints_routing.md"
    markerGroups = @(
      @("<!-- STEP603B_SOUND_SYSTEM_ROUTING_DOCS_BATCH_START -->","STEP603B Sound System Routing Docs Batch","STEP603B")
    )
  },
  @{
    name = "Dashboard Commands"
    path = "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md"
    markerGroups = @(
      @("<!-- STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH_START -->","STEP605 Dashboard Commands Module Docs Batch","STEP605")
    )
  },
  @{
    name = "Communication Bus Contract"
    path = "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md"
    markerGroups = @(
      @("<!-- STEP607_COMMUNICATION_BUS_CONTRACT_BATCH_START -->","STEP607 Communication Bus Contract Module Docs Batch","STEP607")
    )
  },
  @{
    name = "Shoutout System"
    path = "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md"
    markerGroups = @(
      @("<!-- STEP609_SHOUTOUT_CLIP_FEATURES_DOCS_BATCH_START -->","STEP609 Shoutout / Clip Features Module Docs Batch","STEP609")
    )
  }
)

$requiredReportGroups = @(
  @{ logical = "STEP591 routes module docs verification"; candidates = @("step591_routes_module_docs_verification_summary.txt") },
  @{ logical = "STEP592 routes scan triage"; candidates = @("step592_routes_scan_results_triage_summary.txt","step592_routes_scan_triage_summary.txt") },
  @{ logical = "STEP593 routes documentation plan"; candidates = @("step593_routes_documentation_plan_summary.txt","step593_routes_documentation_consolidation_plan_summary.txt") },
  @{ logical = "STEP594 central routes inventory"; candidates = @("step594_central_routes_inventory_summary.txt","step594_central_routes_inventory_report.txt") },
  @{ logical = "STEP595 routes inventory review"; candidates = @("step595_routes_inventory_review_summary.txt","step595_routes_inventory_review_plan_summary.txt") },
  @{ logical = "STEP596 missing routes docs"; candidates = @("step596_missing_routes_docs_summary.txt","step596_missing_routes_documentation_batch_summary.txt") },
  @{ logical = "STEP597 route false positive review"; candidates = @("step597_route_false_positive_review_summary.txt","step597_false_positive_review_summary.txt") },
  @{ logical = "STEP598 module route docs batch plan"; candidates = @("step598_module_route_docs_batch_plan_summary.txt") },
  @{ logical = "STEP599 module route docs batch A"; candidates = @("step599_module_route_docs_batch_a_summary.txt") },
  @{ logical = "STEP600 module route docs batch A verification"; candidates = @("step600_module_route_docs_batch_a_verification_summary.txt") },
  @{ logical = "STEP601 current status crossmodule batch"; candidates = @("step601_current_status_crossmodule_batch_summary.txt") },
  @{ logical = "STEP602 current status crossmodule verification"; candidates = @("step602_current_status_crossmodule_batch_verification_summary.txt","step602_current_status_crossmodule_verification_summary.txt") },
  @{ logical = "STEP603A channelpoints docs batch"; candidates = @("step603a_channelpoints_module_docs_batch_summary.txt") },
  @{ logical = "STEP603B sound routing docs batch"; candidates = @("step603b_sound_system_routing_docs_batch_summary.txt") },
  @{ logical = "STEP604 channelpoints sound routing verification"; candidates = @("step604_channelpoints_sound_routing_verification_summary.txt") },
  @{ logical = "STEP605 dashboard commands docs batch"; candidates = @("step605_dashboard_commands_module_docs_batch_summary.txt") },
  @{ logical = "STEP606 dashboard commands verification"; candidates = @("step606_dashboard_commands_batch_verification_summary.txt") },
  @{ logical = "STEP607 communication bus docs batch"; candidates = @("step607_communication_bus_contract_docs_batch_summary.txt") },
  @{ logical = "STEP608 communication bus verification"; candidates = @("step608_communication_bus_batch_verification_summary.txt") },
  @{ logical = "STEP609 shoutout clip docs batch"; candidates = @("step609_shoutout_clip_features_docs_batch_summary.txt") },
  @{ logical = "STEP610 shoutout clip verification"; candidates = @("step610_shoutout_clip_features_batch_verification_summary.txt") },
  @{ logical = "STEP611A triage fix map"; candidates = @("step611a_completion_verification_triage_summary.txt") }
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
  $missingGroups = @()
  $matchedGroups = @()

  if ($exists) {
    $content = Get-Content -LiteralPath $full -Raw -Encoding UTF8
    foreach ($group in $d.markerGroups) {
      $matched = @()
      foreach ($candidate in $group) {
        if ($content.Contains([string]$candidate)) {
          $matched += [string]$candidate
        }
      }
      if (@($matched).Count -gt 0) {
        $matchedGroups += (@($matched) -join " || ")
      } else {
        $missingGroups += (@($group) -join " OR ")
      }
    }
  } else {
    $errors += "Missing expected doc: " + $rel
    foreach ($group in $d.markerGroups) {
      $missingGroups += (@($group) -join " OR ")
    }
  }

  if (@($missingGroups).Count -gt 0) {
    $warnings += ("Missing marker groups in " + $rel + ": " + (@($missingGroups) -join " ;; "))
  }

  $docChecks += [pscustomobject]@{
    name = [string]$d.name
    path = $rel
    exists = $exists
    requiredGroups = @($d.markerGroups).Count
    matchedGroups = @($matchedGroups).Count
    missingGroups = @($missingGroups).Count
    matched = (@($matchedGroups) -join "; ")
    missing = (@($missingGroups) -join "; ")
  }
}

$reportChecks = @()
foreach ($g in $requiredReportGroups) {
  $found = @()
  foreach ($candidate in $g.candidates) {
    $full = Join-Path $OutDir $candidate
    if (Test-Path -LiteralPath $full) {
      $found += $candidate
    }
  }
  if (@($found).Count -eq 0) {
    $warnings += "Missing report group: " + $g.logical + " expected one of: " + (@($g.candidates) -join ", ")
  }
  $reportChecks += [pscustomobject]@{
    logical = [string]$g.logical
    found = (@($found).Count -gt 0)
    matchedFile = (@($found) -join "; ")
    candidates = (@($g.candidates) -join "; ")
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

$allDocsHaveMarkers = (@($docChecks | Where-Object { $_.missingGroups -gt 0 -or -not $_.exists }).Count -eq 0)
$allReportGroupsFound = (@($reportChecks | Where-Object { -not $_.found }).Count -eq 0)

$completionOk = ($allDocsHaveMarkers -and $allReportGroupsFound -and $step610Ok -and (@($errors).Count -eq 0))

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step611b_fixed_final_completion_verification_summary.txt"
$docChecksTsv = Join-Path $OutDir "step611b_doc_marker_checks.tsv"
$reportChecksTsv = Join-Path $OutDir "step611b_report_group_checks.tsv"
$mdPath = Join-Path $OutDir "step611b_fixed_final_completion_verification.md"
$jsonPath = Join-Path $OutDir "step611b_fixed_final_completion_verification.json"

$docChecks | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $docChecksTsv -Encoding UTF8
$reportChecks | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $reportChecksTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    docsChecked = @($docChecks).Count
    docsWithMissingMarkerGroups = @($docChecks | Where-Object { $_.missingGroups -gt 0 -or -not $_.exists }).Count
    reportGroupsChecked = @($reportChecks).Count
    reportGroupsMissing = @($reportChecks | Where-Object { -not $_.found }).Count
    step610RemainingRealBatches = $remainingReal
    step610RemainingRoutesInventoryBatches = $remainingRoutes
    step610RemainingAllBatches = $remainingAll
    allDocsHaveMarkers = $allDocsHaveMarkers
    allReportGroupsFound = $allReportGroupsFound
    step610Ok = $step610Ok
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
$md.Add("# STEP611B Fixed Final Completion Verification")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Completion OK: " + $completionOk)
$md.Add("Docs checked: " + @($docChecks).Count)
$md.Add("Docs with missing marker groups: " + @($docChecks | Where-Object { $_.missingGroups -gt 0 -or -not $_.exists }).Count)
$md.Add("Report groups checked: " + @($reportChecks).Count)
$md.Add("Report groups missing: " + @($reportChecks | Where-Object { -not $_.found }).Count)
$md.Add("STEP610 remaining all batches: " + $remainingAll)
$md.Add("")
$md.Add("## Doku-Marker-Pruefung")
$md.Add("")
$md.Add("| Doc | Exists | Required groups | Matched groups | Missing groups |")
$md.Add("|---|---:|---:|---:|---:|")
foreach ($d in $docChecks) {
  $md.Add("| " + (Escape-MdCell $d.path) + " | " + $d.exists + " | " + $d.requiredGroups + " | " + $d.matchedGroups + " | " + $d.missingGroups + " |")
}
$md.Add("")
$md.Add("## Report-Gruppen")
$md.Add("")
$md.Add("| Logical report | Found | Matched file |")
$md.Add("|---|---:|---|")
foreach ($r in $reportChecks) {
  $md.Add("| " + (Escape-MdCell $r.logical) + " | " + $r.found + " | " + (Escape-MdCell $r.matchedFile) + " |")
}
$md.Add("")
$md.Add("## Abschluss")
$md.Add("")
if ($completionOk) {
  $md.Add("Die Modul-/Routen-Doku-Batch-Reihe STEP591 bis STEP611B ist abgeschlossen.")
  $md.Add("")
  $md.Add("Empfohlener Folge-Step: STEP612 - Central Status Files Update nach Route-Docs-Abschluss.")
} else {
  $md.Add("Die Abschlusspruefung ist noch nicht sauber. Bitte Warnings/Errors pruefen.")
}
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP611B Fixed Final Completion Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "Docs checked: " + @($docChecks).Count
$summary += "Docs with missing marker groups: " + @($docChecks | Where-Object { $_.missingGroups -gt 0 -or -not $_.exists }).Count
$summary += "Report groups checked: " + @($reportChecks).Count
$summary += "Report groups missing: " + @($reportChecks | Where-Object { -not $_.found }).Count
$summary += "STEP610 remaining real module-doc batches: " + $remainingReal
$summary += "STEP610 remaining central ROUTES inventory batches: " + $remainingRoutes
$summary += "STEP610 remaining all batches: " + $remainingAll
$summary += "All docs have markers: " + $allDocsHaveMarkers
$summary += "All report groups found: " + $allReportGroupsFound
$summary += "STEP610 OK: " + $step610Ok
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
Write-Host "STEP611B Fixed Final Completion Verification fertig."
Write-Host ("Docs checked: " + @($docChecks).Count)
Write-Host ("Docs with missing marker groups: " + @($docChecks | Where-Object { $_.missingGroups -gt 0 -or -not $_.exists }).Count)
Write-Host ("Report groups checked: " + @($reportChecks).Count)
Write-Host ("Report groups missing: " + @($reportChecks | Where-Object { -not $_.found }).Count)
Write-Host ("STEP610 remaining real module-doc batches: " + $remainingReal)
Write-Host ("STEP610 remaining central ROUTES inventory batches: " + $remainingRoutes)
Write-Host ("STEP610 remaining all batches: " + $remainingAll)
Write-Host ("All docs have markers: " + $allDocsHaveMarkers)
Write-Host ("All report groups found: " + $allReportGroupsFound)
Write-Host ("STEP610 OK: " + $step610Ok)
Write-Host ("Completion OK: " + $completionOk)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Doc checks TSV: " + $docChecksTsv)
Write-Host ("Report group checks TSV: " + $reportChecksTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Docs checked: " + @($docChecks).Count)
Write-Host ("Docs with missing marker groups: " + @($docChecks | Where-Object { $_.missingGroups -gt 0 -or -not $_.exists }).Count)
Write-Host ("Report groups checked: " + @($reportChecks).Count)
Write-Host ("Report groups missing: " + @($reportChecks | Where-Object { -not $_.found }).Count)
Write-Host ("STEP610 remaining real module-doc batches: " + $remainingReal)
Write-Host ("STEP610 remaining central ROUTES inventory batches: " + $remainingRoutes)
Write-Host ("STEP610 remaining all batches: " + $remainingAll)
Write-Host ("All docs have markers: " + $allDocsHaveMarkers)
Write-Host ("All report groups found: " + $allReportGroupsFound)
Write-Host ("STEP610 OK: " + $step610Ok)
Write-Host ("Completion OK: " + $completionOk)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
