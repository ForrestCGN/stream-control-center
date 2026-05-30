param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$OutDir = "",
  [switch]$NoWriteDocs
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ProjectRoot)) {
  throw ("Projektpfad nicht gefunden: " + $ProjectRoot)
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path -Path $ProjectRoot -ChildPath "system-scan-output"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$routesTsv = Join-Path $OutDir "step591_detected_routes.tsv"
$missingRoutesTsv = Join-Path $OutDir "step591_routes_missing_doc_mentions.tsv"
$triagePlanTsv = Join-Path $OutDir "step593_routes_documentation_batch_plan.tsv"
$routesDocRel = "docs/backend/ROUTES.md"
$routesDocPath = Join-Path $ProjectRoot ($routesDocRel.Replace("/", "\"))
$docsBackendDir = Split-Path -Parent $routesDocPath

$errors = @()
$warnings = @()

foreach ($p in @($routesTsv,$missingRoutesTsv,$triagePlanTsv)) {
  if (-not (Test-Path -LiteralPath $p)) {
    $errors += ("Missing input file: " + (Split-Path -Leaf $p))
  }
}

$routes = @()
$missing = @()
$plan = @()

if (Test-Path -LiteralPath $routesTsv) { $routes = @(Import-Csv -LiteralPath $routesTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $missingRoutesTsv) { $missing = @(Import-Csv -LiteralPath $missingRoutesTsv -Delimiter "`t") }
if (Test-Path -LiteralPath $triagePlanTsv) { $plan = @(Import-Csv -LiteralPath $triagePlanTsv -Delimiter "`t") }

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

function Get-RouteArea {
  param([string]$Route, [string]$Files)

  $s = (($Route + " " + $Files).ToLowerInvariant())

  if ($s -match "channelpoints") { return "channelpoints" }
  if ($s -match "sound|media|tts|vip") { return "sound_media" }
  if ($s -match "alert|kofi|tipee|bits|sub") { return "alerts" }
  if ($s -match "communication|bus|event") { return "communication_bus" }
  if ($s -match "dashboard|auth|security|admin") { return "dashboard_admin_security" }
  if ($s -match "obs|scene|overlay") { return "obs_overlay" }
  if ($s -match "twitch|presence|chat") { return "twitch_chat" }
  if ($s -match "discord|tagebuch|todo") { return "discord_tagebuch_todo" }
  if ($s -match "hug|death|clip|shoutout|credits|fireworks|challenge|birthday") { return "stream_features" }
  if ($s -match "diagnostic|health|status|debug") { return "diagnostics" }
  return "other"
}

$routeMap = @{}
foreach ($r in $routes) {
  $route = [string]$r.route
  if ([string]::IsNullOrWhiteSpace($route)) { continue }

  if (-not $routeMap.ContainsKey($route)) {
    $routeMap[$route] = [pscustomobject]@{
      route = $route
      methods = @{}
      files = @{}
      hitCount = 0
      examples = @()
    }
  }

  $entry = $routeMap[$route]
  $method = [string]$r.method
  if (-not [string]::IsNullOrWhiteSpace($method)) { $entry.methods[$method] = $true }

  $file = [string]$r.file
  if (-not [string]::IsNullOrWhiteSpace($file)) { $entry.files[$file] = $true }

  $entry.hitCount += 1
  if ($entry.examples.Count -lt 3) {
    $entry.examples += ("{0}:{1} {2}" -f $r.file, $r.line, ([string]$r.raw).Trim())
  }
}

$missingSet = @{}
foreach ($m in $missing) {
  if (-not [string]::IsNullOrWhiteSpace([string]$m.route)) {
    $missingSet[[string]$m.route] = $true
  }
}

$inventory = @()
foreach ($key in ($routeMap.Keys | Sort-Object)) {
  $entry = $routeMap[$key]
  $filesJoined = (($entry.files.Keys | Sort-Object) -join ", ")
  $methodsJoined = (($entry.methods.Keys | Sort-Object) -join ", ")
  $area = Get-RouteArea -Route $entry.route -Files $filesJoined
  $missingDocMention = $missingSet.ContainsKey($entry.route)

  $inventory += [pscustomobject]@{
    area = $area
    route = $entry.route
    methods = $methodsJoined
    files = $filesJoined
    hitCount = $entry.hitCount
    missingDocMention = $missingDocMention
    examples = (($entry.examples) -join " || ")
  }
}

$areaSummary = @(
  $inventory |
    Group-Object area |
    Sort-Object Count -Descending |
    ForEach-Object {
      [pscustomobject]@{
        area = $_.Name
        uniqueRoutes = $_.Count
        missingDocMention = @($_.Group | Where-Object { $_.missingDocMention }).Count
      }
    }
)

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$reportPath = Join-Path $OutDir "step594_central_routes_inventory_report.txt"
$inventoryTsv = Join-Path $OutDir "step594_central_routes_inventory.tsv"
$areaSummaryTsv = Join-Path $OutDir "step594_routes_area_summary.tsv"
$jsonPath = Join-Path $OutDir "step594_central_routes_inventory.json"

$inventory | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $inventoryTsv -Encoding UTF8
$areaSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $areaSummaryTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    routesDoc = $routesDocRel
    routeHitsInput = @($routes).Count
    uniqueRoutes = @($inventory).Count
    areas = @($areaSummary).Count
    missingDocMentions = @($inventory | Where-Object { $_.missingDocMention }).Count
    docsWritten = (-not $NoWriteDocs -and @($errors).Count -eq 0)
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  areaSummary = $areaSummary
  inventory = $inventory
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$md = New-Object System.Collections.Generic.List[string]
$md.Add("# Backend Routes Inventory")
$md.Add("")
$md.Add("Stand: 2026-05-30")
$md.Add("")
$md.Add("## Zweck")
$md.Add("")
$md.Add("Diese Datei ist eine zentrale, scanbasierte Routen-Inventur fuer das Projekt stream-control-center.")
$md.Add("")
$md.Add("Sie wurde aus den lokalen Ergebnissen der STEPs 591 bis 594 erzeugt.")
$md.Add("")
$md.Add("## Wichtiger Hinweis")
$md.Add("")
$md.Add("Diese Inventur ist kein Ersatz fuer fachliche Pruefung.")
$md.Add("")
$md.Add("Quelle: Regex-/Mention-Scan aus backend/**/*.js")
$md.Add("Routen koennen False-Positives enthalten.")
$md.Add("Dynamisch zusammengesetzte Routen koennen fehlen.")
$md.Add("Vor produktiven Aenderungen immer echte Moduldatei pruefen.")
$md.Add("Keine Routen aus dieser Datei ungeprueft als produktiv garantieren.")
$md.Add("")
$md.Add("## Summary")
$md.Add("")
$md.Add("Route hits input: " + @($routes).Count)
$md.Add("Unique routes: " + @($inventory).Count)
$md.Add("Areas: " + @($areaSummary).Count)
$md.Add("Routes missing doc mention: " + @($inventory | Where-Object { $_.missingDocMention }).Count)
$md.Add("Generated: " + $timestamp)
$md.Add("")
$md.Add("## Bereichsuebersicht")
$md.Add("")
$md.Add("| Bereich | Unique routes | Missing doc mention |")
$md.Add("|---|---:|---:|")
foreach ($a in $areaSummary) {
  $md.Add("| " + (Escape-MdCell $a.area) + " | " + $a.uniqueRoutes + " | " + $a.missingDocMention + " |")
}
$md.Add("")
$md.Add("## Priorisierte Doku-Batches aus STEP593")
$md.Add("")
if (@($plan).Count -gt 0) {
  $md.Add("| Batch | Bereich | Score | Action | Primary Doc |")
  $md.Add("|---|---|---:|---|---|")
  foreach ($p in ($plan | Sort-Object @{Expression={IntVal $_.priorityScore};Descending=$true}, batch | Select-Object -First 20)) {
    $md.Add("| " + (Escape-MdCell $p.batch) + " | " + (Escape-MdCell $p.area) + " | " + $p.priorityScore + " | " + (Escape-MdCell $p.recommendedAction) + " | " + (Escape-MdCell $p.primaryDoc) + " |")
  }
} else {
  $md.Add("Keine STEP593-Batchdaten gefunden.")
}
$md.Add("")
$md.Add("## Routen nach Bereichen")
$md.Add("")
foreach ($area in ($inventory | Select-Object -ExpandProperty area -Unique | Sort-Object)) {
  $areaRoutes = @($inventory | Where-Object { $_.area -eq $area } | Sort-Object route)
  $md.Add("### " + $area)
  $md.Add("")
  $md.Add("| Route | Methoden | Dateien | Hits | Doku fehlt? |")
  $md.Add("|---|---|---|---:|---|")
  foreach ($r in $areaRoutes) {
    $missingText = "nein"
    if ($r.missingDocMention) { $missingText = "ja" }
    $filesShort = [string]$r.files
    if ($filesShort.Length -gt 180) { $filesShort = $filesShort.Substring(0, 177) + "..." }
    $md.Add("| " + (Escape-MdCell $r.route) + " | " + (Escape-MdCell $r.methods) + " | " + (Escape-MdCell $filesShort) + " | " + $r.hitCount + " | " + $missingText + " |")
  }
  $md.Add("")
}
$md.Add("## Naechster Schritt")
$md.Add("")
$md.Add("STEP595 - Routes Inventory Review and Docs Update Plan")
$md.Add("")
$md.Add("Ziel: Die Routen-Inventur fachlich pruefen, offensichtliche False-Positives markieren und anschliessend gezielt Modul-Dokus aktualisieren.")

if (-not $NoWriteDocs -and @($errors).Count -eq 0) {
  New-Item -ItemType Directory -Force -Path $docsBackendDir | Out-Null
  ($md -join "`n") | Out-File -FilePath $routesDocPath -Encoding UTF8
}

$report = @()
$report += "STEP594 Central Routes Inventory Draft"
$report += "Generated: " + $timestamp
$report += "Routes doc: " + $routesDocRel
$report += "Route hits input: " + @($routes).Count
$report += "Unique routes: " + @($inventory).Count
$report += "Areas: " + @($areaSummary).Count
$report += "Routes missing doc mention: " + @($inventory | Where-Object { $_.missingDocMention }).Count
$report += "Docs written: " + (-not $NoWriteDocs -and @($errors).Count -eq 0)
$report += "Warnings: " + @($warnings).Count
$report += "Errors: " + @($errors).Count
$report += ""
$report += "Area summary:"
foreach ($a in $areaSummary) {
  $report += ("- " + $a.area + ": routes=" + $a.uniqueRoutes + ", missingDocMention=" + $a.missingDocMention)
}
if (@($warnings).Count -gt 0) {
  $report += ""
  $report += "Warnings:"
  foreach ($w in $warnings) { $report += ("WARN | " + $w) }
}
if (@($errors).Count -gt 0) {
  $report += ""
  $report += "Errors:"
  foreach ($e in $errors) { $report += ("ERROR | " + $e) }
}
$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host ""
Write-Host "STEP594 Central Routes Inventory Draft fertig."
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("Route hits input: " + @($routes).Count)
Write-Host ("Unique routes: " + @($inventory).Count)
Write-Host ("Areas: " + @($areaSummary).Count)
Write-Host ("Routes missing doc mention: " + @($inventory | Where-Object { $_.missingDocMention }).Count)
Write-Host ("Docs written: " + (-not $NoWriteDocs -and @($errors).Count -eq 0))
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Report: " + $reportPath)
Write-Host ("Inventory TSV: " + $inventoryTsv)
Write-Host ("Area summary TSV: " + $areaSummaryTsv)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Routes doc: " + $routesDocRel)
Write-Host ("Route hits input: " + @($routes).Count)
Write-Host ("Unique routes: " + @($inventory).Count)
Write-Host ("Areas: " + @($areaSummary).Count)
Write-Host ("Routes missing doc mention: " + @($inventory | Where-Object { $_.missingDocMention }).Count)
Write-Host ("Docs written: " + (-not $NoWriteDocs -and @($errors).Count -eq 0))
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
