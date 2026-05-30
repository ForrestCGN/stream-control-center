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

$step611DocChecks = Join-Path $OutDir "step611_doc_marker_checks.tsv"
$step611ReportChecks = Join-Path $OutDir "step611_required_report_checks.tsv"
$step611Json = Join-Path $OutDir "step611_final_module_route_docs_completion.json"

foreach ($p in @($step611DocChecks,$step611ReportChecks,$step611Json)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing STEP611 input file: " + $p)
  }
}

$docChecks = @()
$reportChecks = @()
$step611 = $null

if (Test-Path -LiteralPath $step611DocChecks) {
  $docChecks = @(Import-Csv -LiteralPath $step611DocChecks -Delimiter "`t")
}
if (Test-Path -LiteralPath $step611ReportChecks) {
  $reportChecks = @(Import-Csv -LiteralPath $step611ReportChecks -Delimiter "`t")
}
if (Test-Path -LiteralPath $step611Json) {
  try {
    $step611 = Get-Content -LiteralPath $step611Json -Raw -Encoding UTF8 | ConvertFrom-Json
  } catch {
    $warnings += "Could not parse STEP611 JSON: " + $_.Exception.Message
  }
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

function ToBool {
  param($Value)
  $s = ([string]$Value).Trim()
  return ($s -eq "True" -or $s -eq "true" -or $s -eq "1")
}

function Find-SimilarReports {
  param([string]$MissingName, [string]$OutDir)

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($MissingName)
  $tokens = @(
    $baseName -split "[_\-. ]+" |
      Where-Object { $_.Length -ge 4 -and $_ -notin @("step","summary","verification","docs","batch","module","route","routes") }
  )

  $all = @(Get-ChildItem -LiteralPath $OutDir -File -ErrorAction SilentlyContinue | Sort-Object Name)
  $scored = @()

  foreach ($f in $all) {
    $score = 0
    foreach ($t in $tokens) {
      if ($f.Name -like ("*" + $t + "*")) { $score += 1 }
    }
    if ($f.Name -like ("*" + (($baseName -replace "_summary$","") ) + "*")) { $score += 5 }
    if ($score -gt 0) {
      $scored += [pscustomobject]@{
        missing = $MissingName
        candidate = $f.Name
        score = $score
      }
    }
  }

  return @($scored | Sort-Object @{Expression={$_.score};Descending=$true}, candidate | Select-Object -First 5)
}

$missingDocRows = @(
  $docChecks | Where-Object {
    (-not (ToBool $_.exists)) -or ([int]$_.missingMarkerCount -gt 0)
  }
)

$missingReportRows = @(
  $reportChecks | Where-Object { -not (ToBool $_.exists) }
)

$similarReports = @()
foreach ($m in $missingReportRows) {
  $similarReports += @(Find-SimilarReports -MissingName ([string]$m.file) -OutDir $OutDir)
}

$markerFixMap = @()
foreach ($d in $missingDocRows) {
  $rel = [string]$d.path
  $full = Join-Path $ProjectRoot ($rel.Replace("/", "\"))
  $existingStepMarkers = @()
  if (Test-Path -LiteralPath $full) {
    $content = Get-Content -LiteralPath $full -Raw -Encoding UTF8
    $matches = [regex]::Matches($content, "<!--\s*STEP[0-9A-Z_]+.*?-->")
    foreach ($match in $matches) {
      $existingStepMarkers += $match.Value
    }
  }

  $markerFixMap += [pscustomobject]@{
    doc = $rel
    missingMarkerCount = $d.missingMarkerCount
    missingMarkers = $d.missingMarkers
    existingStepMarkers = (@($existingStepMarkers) -join "; ")
  }
}

$reportFixMap = @()
foreach ($m in $missingReportRows) {
  $candidates = @($similarReports | Where-Object { $_.missing -eq $m.file } | Select-Object -ExpandProperty candidate)
  $reportFixMap += [pscustomobject]@{
    missingReport = [string]$m.file
    similarExistingReports = (@($candidates) -join "; ")
  }
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$markerFixTsv = Join-Path $OutDir "step611a_missing_marker_fix_map.tsv"
$reportFixTsv = Join-Path $OutDir "step611a_missing_report_fix_map.tsv"
$similarReportsTsv = Join-Path $OutDir "step611a_similar_existing_reports.tsv"
$summaryPath = Join-Path $OutDir "step611a_completion_verification_triage_summary.txt"
$mdPath = Join-Path $OutDir "step611a_completion_verification_triage.md"
$jsonPath = Join-Path $OutDir "step611a_completion_verification_triage.json"

$markerFixMap | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $markerFixTsv -Encoding UTF8
$reportFixMap | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $reportFixTsv -Encoding UTF8
$similarReports | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $similarReportsTsv -Encoding UTF8

$likelyOnlyVerifierMappingIssue = ($errors.Count -eq 0 -and @($missingDocRows).Count -le 1 -and @($missingReportRows).Count -gt 0 -and @($similarReports).Count -gt 0)

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    missingDocsOrMarkers = @($missingDocRows).Count
    missingReports = @($missingReportRows).Count
    similarReportCandidates = @($similarReports).Count
    likelyOnlyVerifierMappingIssue = $likelyOnlyVerifierMappingIssue
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  missingDocRows = $missingDocRows
  markerFixMap = $markerFixMap
  missingReportRows = $missingReportRows
  reportFixMap = $reportFixMap
  similarReports = $similarReports
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP611A Completion Verification Triage / Fix Map")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Missing docs/markers: " + @($missingDocRows).Count)
$md.Add("Missing reports: " + @($missingReportRows).Count)
$md.Add("Similar report candidates: " + @($similarReports).Count)
$md.Add("Likely verifier mapping issue only: " + $likelyOnlyVerifierMappingIssue)
$md.Add("")
$md.Add("## Fehlende Marker")
$md.Add("")
$md.Add("| Doc | Missing marker count | Missing markers | Existing STEP markers |")
$md.Add("|---|---:|---|---|")
foreach ($m in $markerFixMap) {
  $md.Add("| " + (Escape-MdCell $m.doc) + " | " + $m.missingMarkerCount + " | " + (Escape-MdCell $m.missingMarkers) + " | " + (Escape-MdCell $m.existingStepMarkers) + " |")
}
$md.Add("")
$md.Add("## Fehlende Reports und Kandidaten")
$md.Add("")
$md.Add("| Missing report | Similar existing reports |")
$md.Add("|---|---|")
foreach ($r in $reportFixMap) {
  $md.Add("| " + (Escape-MdCell $r.missingReport) + " | " + (Escape-MdCell $r.similarExistingReports) + " |")
}
$md.Add("")
$md.Add("## Empfehlung")
$md.Add("")
if ($likelyOnlyVerifierMappingIssue) {
  $md.Add("Wahrscheinlich ist STEP611 nur zu streng bzw. erwartet falsche Marker-/Reportnamen. Naechster Schritt: STEP611B mit korrigierter Completion Verification.")
} else {
  $md.Add("Bitte Fix-Map pruefen. Je nach Ergebnis entweder STEP611B als korrigierte Verification oder Recovery-Step bauen.")
}
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP611A Completion Verification Triage Summary"
$summary += "Generated: " + $timestamp
$summary += "Missing docs/markers: " + @($missingDocRows).Count
$summary += "Missing reports: " + @($missingReportRows).Count
$summary += "Similar report candidates: " + @($similarReports).Count
$summary += "Likely verifier mapping issue only: " + $likelyOnlyVerifierMappingIssue
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Missing marker rows:"
foreach ($m in $markerFixMap) {
  $summary += ("- " + $m.doc + " | missing=" + $m.missingMarkerCount + " | " + $m.missingMarkers)
}
$summary += ""
$summary += "Missing report rows:"
foreach ($r in $reportFixMap) {
  $summary += ("- " + $r.missingReport + " | similar=" + $r.similarExistingReports)
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
Write-Host "STEP611A Completion Verification Triage / Fix Map fertig."
Write-Host ("Missing docs/markers: " + @($missingDocRows).Count)
Write-Host ("Missing reports: " + @($missingReportRows).Count)
Write-Host ("Similar report candidates: " + @($similarReports).Count)
Write-Host ("Likely verifier mapping issue only: " + $likelyOnlyVerifierMappingIssue)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Marker fix map TSV: " + $markerFixTsv)
Write-Host ("Report fix map TSV: " + $reportFixTsv)
Write-Host ("Similar reports TSV: " + $similarReportsTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Missing docs/markers: " + @($missingDocRows).Count)
Write-Host ("Missing reports: " + @($missingReportRows).Count)
Write-Host ("Similar report candidates: " + @($similarReports).Count)
Write-Host ("Likely verifier mapping issue only: " + $likelyOnlyVerifierMappingIssue)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host "Missing marker rows:"
foreach ($m in $markerFixMap) {
  Write-Host ("- " + $m.doc + " | missing=" + $m.missingMarkerCount + " | " + $m.missingMarkers)
}
Write-Host "Missing report rows:"
foreach ($r in $reportFixMap) {
  Write-Host ("- " + $r.missingReport + " | similar=" + $r.similarExistingReports)
}
