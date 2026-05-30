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

$nextRowsTsv = Join-Path $OutDir "step600_next_real_module_doc_batch_rows.tsv"
$targetDocRel = "docs/current/CURRENT_SYSTEM_STATUS.md"
$targetDocPath = Join-Path $ProjectRoot ($targetDocRel.Replace("/", "\"))

$errors = @()
$warnings = @()

foreach ($p in @($nextRowsTsv,$targetDocPath)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$rows = @()
if (Test-Path -LiteralPath $nextRowsTsv) {
  $rows = @(Import-Csv -LiteralPath $nextRowsTsv -Delimiter "`t")
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
  param([string]$Text, [int]$Max = 150)
  if ($null -eq $Text) { return "" }
  $s = [string]$Text
  if ($s.Length -le $Max) { return $s }
  return $s.Substring(0, $Max - 3) + "..."
}

$batchName = ""
if (@($rows).Count -gt 0) { $batchName = [string]$rows[0].batch }

$targetMismatch = @($rows | Where-Object { [string]$_.proposedDocTarget -ne $targetDocRel })
if (@($targetMismatch).Count -gt 0) {
  $warnings += "Some rows do not target " + $targetDocRel + "; they will still be listed for review."
}

$highCount = @($rows | Where-Object { $_.priority -eq "high" }).Count
$reviewCount = @($rows | Where-Object { $_.priority -eq "review" }).Count
$totalHits = 0
foreach ($r in $rows) { $totalHits += IntVal $r.routeHitCount }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$sectionMarker = "<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_START -->"
$sectionEnd = "<!-- STEP601_CURRENT_STATUS_CROSSMODULE_BATCH_END -->"

$section = New-Object System.Collections.Generic.List[string]
$section.Add("")
$section.Add($sectionMarker)
$section.Add("")
$section.Add("## STEP601 Crossmodule Route Documentation Batch")
$section.Add("")
$section.Add("Stand: 2026-05-30")
$section.Add("")
$section.Add("Dieser Abschnitt dokumentiert den aus STEP600 ausgewaehlten echten Modul-/Status-Doku-Batch.")
$section.Add("")
$section.Add("Ziel ist eine zentrale Status-Einordnung fuer Module, deren Routen laut Scan/Triage aktuell eher in `CURRENT_SYSTEM_STATUS.md` als in einer neuen Einzel-Doku zusammengefasst werden sollen.")
$section.Add("")
$section.Add("### Batch")
$section.Add("")
$section.Add("Batch: " + $batchName)
$section.Add("Ziel-Doku: " + $targetDocRel)
$section.Add("Module im Batch: " + @($rows).Count)
$section.Add("High Priority: " + $highCount)
$section.Add("Review Priority: " + $reviewCount)
$section.Add("Route Hits: " + $totalHits)
$section.Add("Quelle: system-scan-output/step600_next_real_module_doc_batch_rows.tsv")
$section.Add("Generated: " + $timestamp)
$section.Add("")
$section.Add("### Arbeitsregel")
$section.Add("")
$section.Add("1. Diese Liste ist scan-/triagebasiert.")
$section.Add("2. Sie beschreibt Doku-Bedarf und Status-Einordnung, keine neue Funktionalitaet.")
$section.Add("3. Keine produktive Route ungeprueft aus Scan-Treffern ableiten.")
$section.Add("4. Moduldatei und Router-Kontext bleiben fuer fachliche Aussagen massgeblich.")
$section.Add("")
$section.Add("### Module in diesem Crossmodule-Batch")
$section.Add("")
$section.Add("| Priority | Module | File | Route Hits | Action |")
$section.Add("|---|---|---|---:|---|")
foreach ($r in ($rows | Sort-Object priority,module)) {
  $section.Add("| " + (Escape-MdCell $r.priority) + " | " + (Escape-MdCell $r.module) + " | " + (Escape-MdCell (Shorten ([string]$r.file) 170)) + " | " + $r.routeHitCount + " | " + (Escape-MdCell $r.recommendedAction) + " |")
}
$section.Add("")
$section.Add("### Bedeutung fuer den aktuellen Systemstatus")
$section.Add("")
$section.Add("Dieser Batch zeigt, dass mehrere route-tragende Module zwar in der zentralen Inventur erfasst sind, aber fuer die operative Projektuebergabe weiterhin einen kompakten Status-/Doku-Hinweis brauchen.")
$section.Add("")
$section.Add("Die Eintraege bleiben bewusst als Doku-/Review-Liste formuliert. Eine spaetere Detail-Doku darf daraus nur nach gezielter Pruefung der echten Dateien entstehen.")
$section.Add("")
$section.Add("### Naechster Schritt")
$section.Add("")
$section.Add("STEP602 - Current Status Crossmodule Batch Verification")
$section.Add("")
$section.Add("Ziel: Pruefen, ob CURRENT_SYSTEM_STATUS.md sauber ergaenzt wurde und danach den naechsten echten Modul-Doku-Batch bestimmen.")
$section.Add("")
$section.Add($sectionEnd)
$section.Add("")

$docsWritten = $false
$sectionReplaced = $false

if (@($errors).Count -eq 0) {
  $content = Get-Content -LiteralPath $targetDocPath -Raw -Encoding UTF8
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

$summaryPath = Join-Path $OutDir "step601_current_status_crossmodule_batch_summary.txt"
$rowsOutTsv = Join-Path $OutDir "step601_current_status_crossmodule_batch_rows.tsv"
$jsonPath = Join-Path $OutDir "step601_current_status_crossmodule_batch.json"

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
$summary += "STEP601 Current Status Crossmodule Batch Summary"
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
Write-Host "STEP601 Current Status Crossmodule Batch fertig."
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
