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
$falsePositiveTsv = Join-Path $OutDir "step595_false_positive_candidates.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($routesDocPath,$falsePositiveTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$fp = @()
if (Test-Path -LiteralPath $falsePositiveTsv) {
  $fp = @(Import-Csv -LiteralPath $falsePositiveTsv -Delimiter "`t")
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
  param([string]$Text, [int]$Max = 140)
  if ($null -eq $Text) { return "" }
  $s = [string]$Text
  if ($s.Length -le $Max) { return $s }
  return $s.Substring(0, $Max - 3) + "..."
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$riskSummary = @(
  $fp |
    Group-Object risk |
    Sort-Object Count -Descending |
    ForEach-Object {
      [pscustomobject]@{
        risk = $_.Name
        count = $_.Count
        highPriority = @($_.Group | Where-Object { $_.priority -eq "high" }).Count
        reviewPriority = @($_.Group | Where-Object { $_.priority -eq "review" }).Count
        missingDocMention = @($_.Group | Where-Object { ([string]$_.missingDocMention).ToLowerInvariant() -eq "true" }).Count
      }
    }
)

$areaSummary = @(
  $fp |
    Group-Object area |
    Sort-Object Count -Descending |
    ForEach-Object {
      [pscustomobject]@{
        area = $_.Name
        count = $_.Count
        dynamicOrPattern = @($_.Group | Where-Object { $_.risk -eq "dynamic_or_pattern" }).Count
        unknownMethod = @($_.Group | Where-Object { $_.risk -eq "unknown_method" }).Count
        manyHits = @($_.Group | Where-Object { $_.risk -eq "many_hits" }).Count
      }
    }
)

$topReview = @(
  $fp |
    Sort-Object risk, area, route |
    Select-Object -First 80
)

$sectionMarker = "<!-- STEP597_FALSE_POSITIVE_REVIEW_START -->"
$sectionEnd = "<!-- STEP597_FALSE_POSITIVE_REVIEW_END -->"

$section = New-Object System.Collections.Generic.List[string]
$section.Add("")
$section.Add($sectionMarker)
$section.Add("")
$section.Add("## STEP597 False-Positive Review Hinweise")
$section.Add("")
$section.Add("Stand: 2026-05-30")
$section.Add("")
$section.Add("Dieser Abschnitt dokumentiert die aus STEP595 erkannten False-Positive-Kandidaten der scanbasierten Routen-Inventur.")
$section.Add("")
$section.Add("Wichtig: Diese Kandidaten duerfen nicht automatisch als echte produktive Routen behandelt werden.")
$section.Add("")
$section.Add("### Zusammenfassung")
$section.Add("")
$section.Add("False-positive candidates total: " + @($fp).Count)
$section.Add("Risiko-Gruppen: " + @($riskSummary).Count)
$section.Add("Bereiche: " + @($areaSummary).Count)
$section.Add("Quelle: system-scan-output/step595_false_positive_candidates.tsv")
$section.Add("Generated: " + $timestamp)
$section.Add("")
$section.Add("### Risiko-Gruppen")
$section.Add("")
$section.Add("| Risiko | Count | High Priority | Review Priority | Missing Doc Mention |")
$section.Add("|---|---:|---:|---:|---:|")
foreach ($r in $riskSummary) {
  $section.Add("| " + (Escape-MdCell $r.risk) + " | " + $r.count + " | " + $r.highPriority + " | " + $r.reviewPriority + " | " + $r.missingDocMention + " |")
}
$section.Add("")
$section.Add("### Bereiche")
$section.Add("")
$section.Add("| Bereich | Count | Dynamic/Pattern | Unknown Method | Many Hits |")
$section.Add("|---|---:|---:|---:|---:|")
foreach ($a in $areaSummary) {
  $section.Add("| " + (Escape-MdCell $a.area) + " | " + $a.count + " | " + $a.dynamicOrPattern + " | " + $a.unknownMethod + " | " + $a.manyHits + " |")
}
$section.Add("")
$section.Add("### Review-Auszug")
$section.Add("")
$section.Add("Die folgende Liste ist bewusst begrenzt. Vollstaendige Details liegen in system-scan-output/step595_false_positive_candidates.tsv.")
$section.Add("")
$section.Add("| Risk | Area | Route | Methods | Files | Note |")
$section.Add("|---|---|---|---|---|---|")
foreach ($r in $topReview) {
  $filesShort = Shorten ([string]$r.files) 150
  $section.Add("| " + (Escape-MdCell $r.risk) + " | " + (Escape-MdCell $r.area) + " | " + (Escape-MdCell $r.route) + " | " + (Escape-MdCell $r.methods) + " | " + (Escape-MdCell $filesShort) + " | " + (Escape-MdCell $r.note) + " |")
}
$section.Add("")
$section.Add("### Arbeitsregel fuer folgende Doku-Steps")
$section.Add("")
$section.Add("1. Ein Kandidat mit unknown_method, dynamic_or_pattern oder many_hits wird nicht automatisch als Route dokumentiert.")
$section.Add("2. Zuerst die echte Moduldatei und den Express-/Router-Kontext pruefen.")
$section.Add("3. Nur bestaetigte Routen in Modul-Dokus uebernehmen.")
$section.Add("4. Unbestaetigte Kandidaten bleiben als Scan-Hinweis in dieser Inventur.")
$section.Add("")
$section.Add("### Naechster Schritt")
$section.Add("")
$section.Add("STEP598 - Module Route Docs Batch Plan")
$section.Add("")
$section.Add("Ziel: Aus bestaetigbaren Routen und den STEP595-Zielbereichen kleine Modul-Doku-Batches planen.")
$section.Add("")
$section.Add($sectionEnd)
$section.Add("")

$docsWritten = $false
$sectionReplaced = $false

if (@($errors).Count -eq 0) {
  $content = Get-Content -LiteralPath $routesDocPath -Raw -Encoding UTF8
  $sectionText = ($section -join "`n").Trim()

  if ($content.Contains($sectionMarker) -and $content.Contains($sectionEnd)) {
    $sectionReplaced = $true
    $pattern = [regex]::Escape($sectionMarker) + "(?s).*?" + [regex]::Escape($sectionEnd)
    $content = [regex]::Replace($content, $pattern, $sectionText)
  } else {
    $content = $content.TrimEnd() + "`n`n" + $sectionText + "`n"
  }

  Set-Content -LiteralPath $routesDocPath -Value $content -Encoding UTF8
  $docsWritten = $true
}

$summaryPath = Join-Path $OutDir "step597_false_positive_review_summary.txt"
$riskTsv = Join-Path $OutDir "step597_false_positive_risk_summary.tsv"
$areaTsv = Join-Path $OutDir "step597_false_positive_area_summary.tsv"
$jsonPath = Join-Path $OutDir "step597_false_positive_review.json"

$riskSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $riskTsv -Encoding UTF8
$areaSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $areaTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    routesDoc = $routesDocRel
    falsePositiveCandidates = @($fp).Count
    riskGroups = @($riskSummary).Count
    areas = @($areaSummary).Count
    docsWritten = $docsWritten
    sectionReplaced = $sectionReplaced
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  riskSummary = $riskSummary
  areaSummary = $areaSummary
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP597 Route Inventory False-Positive Review Summary"
$summary += "Generated: " + $timestamp
$summary += "Routes doc: " + $routesDocRel
$summary += "False-positive candidates: " + @($fp).Count
$summary += "Risk groups: " + @($riskSummary).Count
$summary += "Areas: " + @($areaSummary).Count
$summary += "Docs written: " + $docsWritten
$summary += "Section replaced: " + $sectionReplaced
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Risk summary:"
foreach ($r in $riskSummary) {
  $summary += ("- " + $r.risk + ": count=" + $r.count + ", review=" + $r.reviewPriority + ", high=" + $r.highPriority)
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
Write-Host "STEP597 Route Inventory False-Positive Review fertig."
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("False-positive candidates: " + @($fp).Count)
Write-Host ("Risk groups: " + @($riskSummary).Count)
Write-Host ("Areas: " + @($areaSummary).Count)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $sectionReplaced)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Risk TSV: " + $riskTsv)
Write-Host ("Area TSV: " + $areaTsv)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("False-positive candidates: " + @($fp).Count)
Write-Host ("Risk groups: " + @($riskSummary).Count)
Write-Host ("Areas: " + @($areaSummary).Count)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $sectionReplaced)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
