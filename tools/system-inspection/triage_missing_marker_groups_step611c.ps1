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

$step611bDocChecks = Join-Path $OutDir "step611b_doc_marker_checks.tsv"
$step611bJson = Join-Path $OutDir "step611b_fixed_final_completion_verification.json"

foreach ($p in @($step611bDocChecks,$step611bJson)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing STEP611B input file: " + $p)
  }
}

$docChecks = @()
$step611b = $null

if (Test-Path -LiteralPath $step611bDocChecks) {
  $docChecks = @(Import-Csv -LiteralPath $step611bDocChecks -Delimiter "`t")
}

if (Test-Path -LiteralPath $step611bJson) {
  try {
    $step611b = Get-Content -LiteralPath $step611bJson -Raw -Encoding UTF8 | ConvertFrom-Json
  } catch {
    $warnings += "Could not parse STEP611B JSON: " + $_.Exception.Message
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

$missingRows = @(
  $docChecks | Where-Object {
    (-not (ToBool $_.exists)) -or ([int]$_.missingGroups -gt 0)
  }
)

$triageRows = @()

foreach ($row in $missingRows) {
  $rel = [string]$row.path
  $full = Join-Path $ProjectRoot ($rel.Replace("/", "\"))

  $existingStepMarkers = @()
  $stepHeadings = @()
  $nearbyLines = @()

  if (Test-Path -LiteralPath $full) {
    $content = Get-Content -LiteralPath $full -Raw -Encoding UTF8
    $lines = Get-Content -LiteralPath $full -Encoding UTF8

    $matches = [regex]::Matches($content, "<!--\s*STEP[0-9A-Z_][^>]*-->")
    foreach ($match in $matches) {
      $existingStepMarkers += $match.Value
    }

    for ($i = 0; $i -lt $lines.Count; $i++) {
      $line = [string]$lines[$i]
      if ($line -match "STEP[0-9A-Z]+") {
        $stepHeadings += ("L" + ($i + 1) + ": " + $line.Trim())
      }
    }

    $missingText = [string]$row.missing
    $tokens = @()
    foreach ($part in ($missingText -split "[\s<>\-/;:_]+")) {
      if ($part.Length -ge 5 -and $part -notin @("START","END","STEP")) {
        $tokens += $part
      }
    }
    $tokens = @($tokens | Select-Object -Unique)

    for ($i = 0; $i -lt $lines.Count; $i++) {
      $line = [string]$lines[$i]
      $hit = $false
      foreach ($t in $tokens) {
        if ($line -like ("*" + $t + "*")) { $hit = $true }
      }
      if ($hit) {
        $start = [Math]::Max(0, $i - 2)
        $end = [Math]::Min($lines.Count - 1, $i + 2)
        for ($j = $start; $j -le $end; $j++) {
          $nearbyLines += ("L" + ($j + 1) + ": " + ([string]$lines[$j]).Trim())
        }
      }
    }
  }

  $triageRows += [pscustomobject]@{
    doc = $rel
    exists = $row.exists
    missingGroups = $row.missingGroups
    missingDefinition = $row.missing
    matchedDefinition = $row.matched
    existingStepMarkers = (@($existingStepMarkers | Select-Object -Unique) -join "; ")
    stepHeadings = (@($stepHeadings | Select-Object -First 20) -join "; ")
    nearbyCandidateLines = (@($nearbyLines | Select-Object -Unique -First 40) -join "; ")
  }
}

$likelyMappingOnly = $false
if (@($triageRows).Count -gt 0 -and @($errors).Count -eq 0) {
  $mappingHits = 0
  foreach ($t in $triageRows) {
    if (-not [string]::IsNullOrWhiteSpace([string]$t.stepHeadings) -or -not [string]::IsNullOrWhiteSpace([string]$t.existingStepMarkers)) {
      $mappingHits += 1
    }
  }
  $likelyMappingOnly = ($mappingHits -eq @($triageRows).Count)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$triageTsv = Join-Path $OutDir "step611c_missing_marker_group_triage.tsv"
$summaryPath = Join-Path $OutDir "step611c_missing_marker_group_triage_summary.txt"
$mdPath = Join-Path $OutDir "step611c_missing_marker_group_triage.md"
$jsonPath = Join-Path $OutDir "step611c_missing_marker_group_triage.json"

$triageRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $triageTsv -Encoding UTF8

$result = [pscustomObject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    missingDocRows = @($missingRows).Count
    missingMarkerGroups = (@($missingRows | ForEach-Object { [int]$_.missingGroups }) | Measure-Object -Sum).Sum
    triageRows = @($triageRows).Count
    likelyMappingOnly = $likelyMappingOnly
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  triageRows = $triageRows
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# STEP611C Missing Marker Group Triage")
$md.Add("")
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Ergebnis")
$md.Add("")
$md.Add("Missing doc rows: " + @($missingRows).Count)
$md.Add("Triage rows: " + @($triageRows).Count)
$md.Add("Likely mapping only: " + $likelyMappingOnly)
$md.Add("")
$md.Add("## Fehlende Marker-Gruppen")
$md.Add("")
$md.Add("| Doc | Missing groups | Missing definition | Existing STEP markers | STEP headings | Nearby candidate lines |")
$md.Add("|---|---:|---|---|---|---|")
foreach ($r in $triageRows) {
  $md.Add("| " + (Escape-MdCell $r.doc) + " | " + $r.missingGroups + " | " + (Escape-MdCell $r.missingDefinition) + " | " + (Escape-MdCell $r.existingStepMarkers) + " | " + (Escape-MdCell $r.stepHeadings) + " | " + (Escape-MdCell $r.nearbyCandidateLines) + " |")
}
$md.Add("")
$md.Add("## Empfehlung")
$md.Add("")
if ($likelyMappingOnly) {
  $md.Add("Die fehlenden Gruppen wirken wie Mapping-/Marker-Erkennungsproblem. Naechster Schritt: STEP611D mit erweitertem Marker-Mapping oder optional sauberer Marker-Nachtrag.")
} else {
  $md.Add("Mindestens eine Gruppe wirkt nicht eindeutig als Mapping-Thema. Naechster Schritt: STEP611D Recovery/Marker-Nachtrag fuer betroffene Dokus.")
}
($md -join "`n") | Out-File -FilePath $mdPath -Encoding UTF8

$summary = @()
$summary += "STEP611C Missing Marker Group Triage Summary"
$summary += "Generated: " + $timestamp
$summary += "Missing doc rows: " + @($missingRows).Count
$summary += "Missing marker groups total: " + ((@($missingRows | ForEach-Object { [int]$_.missingGroups }) | Measure-Object -Sum).Sum)
$summary += "Triage rows: " + @($triageRows).Count
$summary += "Likely mapping only: " + $likelyMappingOnly
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Missing marker groups:"
foreach ($r in $triageRows) {
  $summary += ("- " + $r.doc + " | missingGroups=" + $r.missingGroups)
  $summary += ("  missing: " + $r.missingDefinition)
  $summary += ("  existing STEP markers: " + $r.existingStepMarkers)
  $summary += ("  STEP headings: " + $r.stepHeadings)
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
Write-Host "STEP611C Missing Marker Group Triage fertig."
Write-Host ("Missing doc rows: " + @($missingRows).Count)
Write-Host ("Missing marker groups total: " + ((@($missingRows | ForEach-Object { [int]$_.missingGroups }) | Measure-Object -Sum).Sum))
Write-Host ("Triage rows: " + @($triageRows).Count)
Write-Host ("Likely mapping only: " + $likelyMappingOnly)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Triage TSV: " + $triageTsv)
Write-Host ("Markdown: " + $mdPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Missing doc rows: " + @($missingRows).Count)
Write-Host ("Missing marker groups total: " + ((@($missingRows | ForEach-Object { [int]$_.missingGroups }) | Measure-Object -Sum).Sum))
Write-Host ("Triage rows: " + @($triageRows).Count)
Write-Host ("Likely mapping only: " + $likelyMappingOnly)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host "Missing marker groups:"
foreach ($r in $triageRows) {
  Write-Host ("- " + $r.doc + " | missingGroups=" + $r.missingGroups)
  Write-Host ("  missing: " + $r.missingDefinition)
  Write-Host ("  existing STEP markers: " + $r.existingStepMarkers)
  Write-Host ("  STEP headings: " + $r.stepHeadings)
}
