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

$nextRowsTsv = Join-Path $OutDir "step604_next_real_module_doc_batch_rows.tsv"
$targetDocRel = "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md"
$targetDocPath = Join-Path $ProjectRoot ($targetDocRel.Replace("/", "\"))

$errors = @()
$warnings = @()

if (-not (Test-Path -LiteralPath $nextRowsTsv)) {
  $errors += "Missing input file: step604_next_real_module_doc_batch_rows.tsv"
}

$rows = @()
if (Test-Path -LiteralPath $nextRowsTsv) {
  $rows = @(Import-Csv -LiteralPath $nextRowsTsv -Delimiter "`t")
}

$targetMismatch = @($rows | Where-Object { [string]$_.proposedDocTarget -ne $targetDocRel })
if (@($targetMismatch).Count -gt 0) {
  $warnings += "Some rows do not target " + $targetDocRel + "; they will still be listed for review."
}

if (-not (Test-Path -LiteralPath $targetDocPath)) {
  $targetDir = Split-Path -Parent $targetDocPath
  New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
  $warnings += "Target doc did not exist and will be created: " + $targetDocRel
}

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
  param([string]$Text, [int]$Max = 170)
  if ($null -eq $Text) { return "" }
  $s = [string]$Text
  if ($s.Length -le $Max) { return $s }
  return $s.Substring(0, $Max - 3) + "..."
}

$batchName = ""
if (@($rows).Count -gt 0) { $batchName = [string]$rows[0].batch }

$highCount = @($rows | Where-Object { $_.priority -eq "high" }).Count
$reviewCount = @($rows | Where-Object { $_.priority -eq "review" }).Count
$totalHits = 0
foreach ($r in $rows) { $totalHits += IntVal $r.routeHitCount }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$sectionMarker = "<!-- STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH_START -->"
$sectionEnd = "<!-- STEP605_DASHBOARD_COMMANDS_MODULE_DOCS_BATCH_END -->"

$section = New-Object System.Collections.Generic.List[string]
$section.Add("")
$section.Add($sectionMarker)
$section.Add("")
$section.Add("## STEP605 Dashboard Commands Module Docs Batch")
$section.Add("")
$section.Add("Stand: 2026-05-30")
$section.Add("")
$section.Add("Dieser Abschnitt dokumentiert den Dashboard-/Commands-Anteil aus dem von STEP604 bestimmten naechsten Modul-Doku-Batch.")
$section.Add("")
$section.Add("### Batch")
$section.Add("")
$section.Add("Batch: " + $batchName)
$section.Add("Ziel-Doku: " + $targetDocRel)
$section.Add("Module im Batch: " + @($rows).Count)
$section.Add("High Priority: " + $highCount)
$section.Add("Review Priority: " + $reviewCount)
$section.Add("Route Hits: " + $totalHits)
$section.Add("Quelle: system-scan-output/step604_next_real_module_doc_batch_rows.tsv")
$section.Add("Generated: " + $timestamp)
$section.Add("")
$section.Add("### Arbeitsregel")
$section.Add("")
$section.Add("1. Diese Eintraege sind scan-/triagebasiert.")
$section.Add("2. Dashboard-/Command-Routen duerfen nur als Doku-Hinweis verstanden werden, nicht als neue Funktionalitaet.")
$section.Add("3. Dashboard muss weiterhin ueber Backend-APIs arbeiten und darf keine SQLite-/Datei-Direktzugriffe etablieren.")
$section.Add("4. Security-/Auth-/Admin-Kontext immer gesondert pruefen.")
$section.Add("5. Keine produktive Route ungeprueft aus Scan-Treffern ableiten.")
$section.Add("")
$section.Add("### Dashboard-/Commands-nahe Module in diesem Batch")
$section.Add("")
$section.Add("| Priority | Module | File | Route Hits | Action |")
$section.Add("|---|---|---|---:|---|")
foreach ($r in ($rows | Sort-Object priority,module)) {
  $section.Add("| " + (Escape-MdCell $r.priority) + " | " + (Escape-MdCell $r.module) + " | " + (Escape-MdCell (Shorten ([string]$r.file) 190)) + " | " + $r.routeHitCount + " | " + (Escape-MdCell $r.recommendedAction) + " |")
}
$section.Add("")
$section.Add("### Abgrenzung")
$section.Add("")
$section.Add("Dieser Abschnitt ist eine Doku-/Review-Zwischenablage fuer Dashboard-/Commands-nahe Scan-Kandidaten.")
$section.Add("")
$section.Add("Er ersetzt keine Sicherheitspruefung, keine Rollen-/Rechtepruefung und keine fachliche Dashboard-Routen-Doku.")
$section.Add("")
$section.Add("### Naechster Schritt")
$section.Add("")
$section.Add("STEP606 - Dashboard Commands Batch Verification")
$section.Add("")
$section.Add("Ziel: Pruefen, ob der STEP605-Abschnitt sauber in der Dashboard-Commands-Konsolidierungsdoku steht und danach den naechsten Modul-Doku-Batch bestimmen.")
$section.Add("")
$section.Add($sectionEnd)
$section.Add("")

$docsWritten = $false
$sectionReplaced = $false

if (@($errors).Count -eq 0) {
  if (Test-Path -LiteralPath $targetDocPath) {
    $content = Get-Content -LiteralPath $targetDocPath -Raw -Encoding UTF8
  } else {
    $content = "# Dashboard Commands Consolidation`n"
  }

  $sectionText = ($section -join "`n").Trim()

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

$summaryPath = Join-Path $OutDir "step605_dashboard_commands_module_docs_batch_summary.txt"
$rowsOutTsv = Join-Path $OutDir "step605_dashboard_commands_module_docs_batch_rows.tsv"
$jsonPath = Join-Path $OutDir "step605_dashboard_commands_module_docs_batch.json"

$rows | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $rowsOutTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    batch = $batchName
    targetDoc = $targetDocRel
    modulesInBatch = @($rows).Count
    highPriorityModules = $highCount
    reviewPriorityModules = $reviewCount
    routeHits = $totalHits
    docsWritten = $docsWritten
    sectionReplaced = $sectionReplaced
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  rows = $rows
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP605 Dashboard Commands Module Docs Batch Summary"
$summary += "Generated: " + $timestamp
$summary += "Batch: " + $batchName
$summary += "Target doc: " + $targetDocRel
$summary += "Modules in batch: " + @($rows).Count
$summary += "High-priority modules: " + $highCount
$summary += "Review-priority modules: " + $reviewCount
$summary += "Route hits: " + $totalHits
$summary += "Docs written: " + $docsWritten
$summary += "Section replaced: " + $sectionReplaced
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Modules:"
foreach ($r in ($rows | Sort-Object priority,module)) {
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
Write-Host "STEP605 Dashboard Commands Module Docs Batch fertig."
Write-Host ("Batch: " + $batchName)
Write-Host ("Target doc: " + $targetDocRel)
Write-Host ("Modules in batch: " + @($rows).Count)
Write-Host ("High-priority modules: " + $highCount)
Write-Host ("Review-priority modules: " + $reviewCount)
Write-Host ("Route hits: " + $totalHits)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $sectionReplaced)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Rows TSV: " + $rowsOutTsv)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Batch: " + $batchName)
Write-Host ("Target doc: " + $targetDocRel)
Write-Host ("Modules in batch: " + @($rows).Count)
Write-Host ("High-priority modules: " + $highCount)
Write-Host ("Review-priority modules: " + $reviewCount)
Write-Host ("Route hits: " + $totalHits)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $sectionReplaced)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
