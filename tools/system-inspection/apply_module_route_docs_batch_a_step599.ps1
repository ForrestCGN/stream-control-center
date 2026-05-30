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

$batchSummaryTsv = Join-Path $OutDir "step598_module_route_docs_batch_summary.tsv"
$batchRowsTsv = Join-Path $OutDir "step598_module_route_docs_batch_rows.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($batchSummaryTsv,$batchRowsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$batchSummary = @()
$batchRows = @()

if (Test-Path -LiteralPath $batchSummaryTsv) { $batchSummary = @(Import-Csv -LiteralPath $batchSummaryTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $batchRowsTsv) { $batchRows = @(Import-Csv -LiteralPath $batchRowsTsv -Delimiter "`t") }

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

function Shorten {
  param([string]$Text, [int]$Max = 140)
  if ($null -eq $Text) { return "" }
  $s = [string]$Text
  if ($s.Length -le $Max) { return $s }
  return $s.Substring(0, $Max - 3) + "..."
}

$selectedBatch = $null
if (@($batchSummary).Count -gt 0) {
  $selectedBatch = @(
    $batchSummary |
      Sort-Object @{Expression={IntVal $_.highPriority};Descending=$true},
                  @{Expression={IntVal $_.totalRouteHits};Descending=$true},
                  batch
  )[0]
}

if ($null -eq $selectedBatch) {
  $errors += "No batch summary rows found."
}

$batchName = ""
$primaryTarget = ""
$targetDocPath = ""
$targetRows = @()

if ($null -ne $selectedBatch) {
  $batchName = [string]$selectedBatch.batch
  $primaryTarget = [string]$selectedBatch.primaryTarget

  if ([string]::IsNullOrWhiteSpace($primaryTarget)) {
    $errors += "Selected batch has empty primaryTarget."
  } elseif ($primaryTarget -match ",") {
    $warnings += "Selected batch has multiple primary targets; using first target."
    $primaryTarget = ($primaryTarget -split ",")[0].Trim()
  }

  $targetDocPath = Join-Path $ProjectRoot ($primaryTarget.Replace("/", "\"))
  $targetRows = @($batchRows | Where-Object { $_.batch -eq $batchName })
}

if (-not [string]::IsNullOrWhiteSpace($targetDocPath)) {
  $targetDir = Split-Path -Parent $targetDocPath
  if (-not (Test-Path -LiteralPath $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  }
  if (-not (Test-Path -LiteralPath $targetDocPath)) {
    $warnings += "Target doc did not exist and will be created: " + $primaryTarget
  }
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$sectionMarker = "<!-- STEP599_MODULE_ROUTE_DOCS_BATCH_A_START -->"
$sectionEnd = "<!-- STEP599_MODULE_ROUTE_DOCS_BATCH_A_END -->"

$highCount = @($targetRows | Where-Object { $_.priority -eq "high" }).Count
$reviewCount = @($targetRows | Where-Object { $_.priority -eq "review" }).Count
$totalHits = 0
foreach ($r in $targetRows) { $totalHits += IntVal $r.routeHitCount }

$section = New-Object System.Collections.Generic.List[string]
$section.Add("")
$section.Add($sectionMarker)
$section.Add("")
$section.Add("## STEP599 Module Route Docs Batch A")
$section.Add("")
$section.Add("Stand: 2026-05-30")
$section.Add("")
$section.Add("Dieser Abschnitt ist ein gezielter Doku-Batch aus STEP598. Er dokumentiert nur den aktuell hoechstpriorisierten Modul-Routen-Batch und erzeugt keine Einzel-Dokus pro Modul.")
$section.Add("")
$section.Add("### Batch")
$section.Add("")
$section.Add("Batch: " + $batchName)
$section.Add("Ziel-Doku: " + $primaryTarget)
$section.Add("Module im Batch: " + @($targetRows).Count)
$section.Add("High Priority: " + $highCount)
$section.Add("Review Priority: " + $reviewCount)
$section.Add("Route Hits: " + $totalHits)
$section.Add("Quelle: system-scan-output/step598_module_route_docs_batch_rows.tsv")
$section.Add("Generated: " + $timestamp)
$section.Add("")
$section.Add("### Arbeitsregel")
$section.Add("")
$section.Add("1. Diese Eintraege sind aus Scan-/Triage-Ergebnissen abgeleitet.")
$section.Add("2. Ein Modul gilt dadurch nicht automatisch als vollstaendig dokumentiert.")
$section.Add("3. Vor funktionalen Entscheidungen immer echte Moduldatei und Router-Kontext pruefen.")
$section.Add("4. Keine produktive Route ungeprueft aus Scan-Treffern ableiten.")
$section.Add("")
$section.Add("### Module in diesem Batch")
$section.Add("")
$section.Add("| Priority | Module | File | Route Hits | Action |")
$section.Add("|---|---|---|---:|---|")
foreach ($r in ($targetRows | Sort-Object priority,module)) {
  $section.Add("| " + (Escape-MdCell $r.priority) + " | " + (Escape-MdCell $r.module) + " | " + (Escape-MdCell (Shorten ([string]$r.file) 160)) + " | " + $r.routeHitCount + " | " + (Escape-MdCell $r.recommendedAction) + " |")
}
$section.Add("")
$section.Add("### Naechster Schritt")
$section.Add("")
$section.Add("STEP600 - Module Route Docs Batch A Verification")
$section.Add("")
$section.Add("Ziel: Pruefen, ob dieser Batch in der Ziel-Doku sauber ergaenzt wurde und ob weitere Batch-Bereiche separat geplant werden muessen.")
$section.Add("")
$section.Add($sectionEnd)
$section.Add("")

$docsWritten = $false
$sectionReplaced = $false

if (@($errors).Count -eq 0) {
  $sectionText = ($section -join "`n").Trim()

  if (Test-Path -LiteralPath $targetDocPath) {
    $content = Get-Content -LiteralPath $targetDocPath -Raw -Encoding UTF8
  } else {
    $content = "# " + (Split-Path -LeafBase $targetDocPath) + "`n"
  }

  if ($content.Contains($sectionMarker) -and $content.Contains($sectionEnd)) {
    $sectionReplaced = $true
    $pattern = [regex]::Escape($sectionMarker) + "(?s).*?" + [regex]::Escape($sectionEnd)
    $content = [regex]::Replace($content, $pattern, $sectionText)
  } else {
    $content = $content.TrimEnd() + "`n`n" + $sectionText + "`n"
  }

  Set-Content -LiteralPath $targetDocPath -Value $content -Encoding UTF8
  $docsWritten = $true
}

$summaryPath = Join-Path $OutDir "step599_module_route_docs_batch_a_summary.txt"
$selectedRowsTsv = Join-Path $OutDir "step599_module_route_docs_batch_a_rows.tsv"
$jsonPath = Join-Path $OutDir "step599_module_route_docs_batch_a.json"

$targetRows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $selectedRowsTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    selectedBatch = $batchName
    targetDoc = $primaryTarget
    modulesInBatch = @($targetRows).Count
    highPriorityModules = $highCount
    reviewPriorityModules = $reviewCount
    routeHits = $totalHits
    docsWritten = $docsWritten
    sectionReplaced = $sectionReplaced
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  selectedBatch = $selectedBatch
  rows = $targetRows
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP599 Module Route Docs Batch A Summary"
$summary += "Generated: " + $timestamp
$summary += "Selected batch: " + $batchName
$summary += "Target doc: " + $primaryTarget
$summary += "Modules in batch: " + @($targetRows).Count
$summary += "High-priority modules: " + $highCount
$summary += "Review-priority modules: " + $reviewCount
$summary += "Route hits: " + $totalHits
$summary += "Docs written: " + $docsWritten
$summary += "Section replaced: " + $sectionReplaced
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Modules:"
foreach ($r in ($targetRows | Sort-Object priority,module)) {
  $summary += ("- " + $r.priority + " | " + $r.module + " | hits=" + $r.routeHitCount + " | file=" + $r.file)
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
Write-Host "STEP599 Module Route Docs Batch A fertig."
Write-Host ("Selected batch: " + $batchName)
Write-Host ("Target doc: " + $primaryTarget)
Write-Host ("Modules in batch: " + @($targetRows).Count)
Write-Host ("High-priority modules: " + $highCount)
Write-Host ("Review-priority modules: " + $reviewCount)
Write-Host ("Route hits: " + $totalHits)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $sectionReplaced)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Selected rows TSV: " + $selectedRowsTsv)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Selected batch: " + $batchName)
Write-Host ("Target doc: " + $primaryTarget)
Write-Host ("Modules in batch: " + @($targetRows).Count)
Write-Host ("High-priority modules: " + $highCount)
Write-Host ("Review-priority modules: " + $reviewCount)
Write-Host ("Route hits: " + $totalHits)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $sectionReplaced)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
