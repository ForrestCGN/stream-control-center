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
$missingReviewTsv = Join-Path $OutDir "step595_missing_routes_review.tsv"
$docTargetsTsv = Join-Path $OutDir "step595_doc_target_summary.tsv"

$errors = @()
$warnings = @()

foreach ($p in @($routesDocPath,$missingReviewTsv,$docTargetsTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + $p)
  }
}

$missingReview = @()
$docTargets = @()

if (Test-Path -LiteralPath $missingReviewTsv) { $missingReview = @(Import-Csv -LiteralPath $missingReviewTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $docTargetsTsv) { $docTargets = @(Import-Csv -LiteralPath $docTargetsTsv -Delimiter "`t") }

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

$sectionMarker = "<!-- STEP596_MISSING_ROUTES_DOC_BATCH_START -->"
$sectionEnd = "<!-- STEP596_MISSING_ROUTES_DOC_BATCH_END -->"

$missingByArea = @(
  $missingReview |
    Group-Object area |
    Sort-Object Count -Descending |
    ForEach-Object {
      [pscustomobject]@{
        area = $_.Name
        routes = $_.Count
        highPriority = @($_.Group | Where-Object { $_.priority -eq "high" }).Count
        reviewPriority = @($_.Group | Where-Object { $_.priority -eq "review" }).Count
      }
    }
)

$section = New-Object System.Collections.Generic.List[string]
$section.Add("")
$section.Add($sectionMarker)
$section.Add("")
$section.Add("## STEP596 Missing Routes Documentation Batch")
$section.Add("")
$section.Add("Stand: 2026-05-30")
$section.Add("")
$section.Add("Dieser Abschnitt dokumentiert gezielt die in STEP591 bis STEP595 gefundenen Routen, die im bisherigen Doku-Text noch nicht erwaehnt wurden.")
$section.Add("")
$section.Add("Wichtig: Auch diese Liste ist scanbasiert. Jede Route muss vor produktiven Entscheidungen in der echten Moduldatei geprueft werden.")
$section.Add("")
$section.Add("### Zusammenfassung")
$section.Add("")
$section.Add("Missing routes total: " + @($missingReview).Count)
$section.Add("Bereiche: " + @($missingByArea).Count)
$section.Add("Quelle: system-scan-output/step595_missing_routes_review.tsv")
$section.Add("Generated: " + $timestamp)
$section.Add("")
$section.Add("### Missing Routes nach Bereichen")
$section.Add("")
$section.Add("| Bereich | Routes | High Priority | Review Priority |")
$section.Add("|---|---:|---:|---:|")
foreach ($a in $missingByArea) {
  $section.Add("| " + (Escape-MdCell $a.area) + " | " + $a.routes + " | " + $a.highPriority + " | " + $a.reviewPriority + " |")
}
$section.Add("")
$section.Add("### Detail-Liste")
$section.Add("")
$section.Add("| Priority | Bereich | Risk | Route | Methods | Files | Hinweis |")
$section.Add("|---|---|---|---|---|---|---|")
foreach ($r in ($missingReview | Sort-Object area, priority, route)) {
  $filesShort = Shorten ([string]$r.files) 160
  $section.Add("| " + (Escape-MdCell $r.priority) + " | " + (Escape-MdCell $r.area) + " | " + (Escape-MdCell $r.risk) + " | " + (Escape-MdCell $r.route) + " | " + (Escape-MdCell $r.methods) + " | " + (Escape-MdCell $filesShort) + " | " + (Escape-MdCell $r.note) + " |")
}
$section.Add("")
$section.Add("### Doku-Zielbereiche aus STEP595")
$section.Add("")
$section.Add("Diese Zielbereiche sind nur eine Planungsgrundlage. Es werden mit diesem STEP keine Modul-Dokus automatisch geaendert.")
$section.Add("")
$section.Add("| Ziel-Doku | Module | High Priority Modules | Route Hits |")
$section.Add("|---|---:|---:|---:|")
foreach ($d in $docTargets) {
  $section.Add("| " + (Escape-MdCell $d.docTarget) + " | " + $d.modules + " | " + $d.highPriorityModules + " | " + $d.totalRouteHits + " |")
}
$section.Add("")
$section.Add("### Naechster Schritt")
$section.Add("")
$section.Add("STEP597 - Route Inventory False-Positive Review")
$section.Add("")
$section.Add("Ziel: Die 357 False-Positive-Kandidaten aus STEP595 nicht blind uebernehmen, sondern nach Risiko gruppieren und nur sinnvolle Doku-Hinweise ableiten.")
$section.Add("")
$section.Add($sectionEnd)
$section.Add("")

$docsWritten = $false
$alreadyPresent = $false

if (@($errors).Count -eq 0) {
  $content = Get-Content -LiteralPath $routesDocPath -Raw -Encoding UTF8
  if ($content.Contains($sectionMarker) -and $content.Contains($sectionEnd)) {
    $alreadyPresent = $true
    $pattern = [regex]::Escape($sectionMarker) + "(?s).*?" + [regex]::Escape($sectionEnd)
    $replacement = (($section | Where-Object { $_ -ne "" -or $true }) -join "`n").Trim()
    $content = [regex]::Replace($content, $pattern, $replacement)
  } else {
    $content = $content.TrimEnd() + "`n`n" + (($section | Where-Object { $_ -ne "" -or $true }) -join "`n").Trim() + "`n"
  }

  Set-Content -LiteralPath $routesDocPath -Value $content -Encoding UTF8
  $docsWritten = $true
}

$summaryPath = Join-Path $OutDir "step596_missing_routes_documentation_batch_summary.txt"
$areaTsv = Join-Path $OutDir "step596_missing_routes_by_area.tsv"
$jsonPath = Join-Path $OutDir "step596_missing_routes_documentation_batch.json"

$missingByArea | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $areaTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    routesDoc = $routesDocRel
    missingRoutesDocumented = @($missingReview).Count
    missingRouteAreas = @($missingByArea).Count
    docTargetRows = @($docTargets).Count
    docsWritten = $docsWritten
    sectionReplaced = $alreadyPresent
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  missingRoutesByArea = $missingByArea
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP596 Missing Routes Documentation Batch Summary"
$summary += "Generated: " + $timestamp
$summary += "Routes doc: " + $routesDocRel
$summary += "Missing routes documented: " + @($missingReview).Count
$summary += "Missing route areas: " + @($missingByArea).Count
$summary += "Doc target rows: " + @($docTargets).Count
$summary += "Docs written: " + $docsWritten
$summary += "Section replaced: " + $alreadyPresent
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Missing routes by area:"
foreach ($a in $missingByArea) {
  $summary += ("- " + $a.area + ": routes=" + $a.routes + ", high=" + $a.highPriority + ", review=" + $a.reviewPriority)
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
Write-Host "STEP596 Missing Routes Documentation Batch fertig."
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("Missing routes documented: " + @($missingReview).Count)
Write-Host ("Missing route areas: " + @($missingByArea).Count)
Write-Host ("Doc target rows: " + @($docTargets).Count)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $alreadyPresent)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Area TSV: " + $areaTsv)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("Missing routes documented: " + @($missingReview).Count)
Write-Host ("Missing route areas: " + @($missingByArea).Count)
Write-Host ("Doc target rows: " + @($docTargets).Count)
Write-Host ("Docs written: " + $docsWritten)
Write-Host ("Section replaced: " + $alreadyPresent)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
