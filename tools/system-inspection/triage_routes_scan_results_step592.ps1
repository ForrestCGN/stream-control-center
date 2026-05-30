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

$missingRoutesPath = Join-Path $OutDir "step591_routes_missing_doc_mentions.tsv"
$moduleStatusPath = Join-Path $OutDir "step591_module_doc_status.tsv"

$errors = @()
$warnings = @()

if (-not (Test-Path -LiteralPath $missingRoutesPath)) {
  $errors += "Missing STEP591 file: step591_routes_missing_doc_mentions.tsv"
}
if (-not (Test-Path -LiteralPath $moduleStatusPath)) {
  $errors += "Missing STEP591 file: step591_module_doc_status.tsv"
}

$missingRoutes = @()
$moduleStatus = @()

if (Test-Path -LiteralPath $missingRoutesPath) {
  $missingRoutes = @(Import-Csv -LiteralPath $missingRoutesPath -Delimiter "`t")
}
if (Test-Path -LiteralPath $moduleStatusPath) {
  $moduleStatus = @(Import-Csv -LiteralPath $moduleStatusPath -Delimiter "`t")
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

function Get-ModuleArea {
  param([string]$File, [string]$Module)

  $s = (($File + " " + $Module).ToLowerInvariant())

  if ($s -match "channelpoints") { return "channelpoints" }
  if ($s -match "sound|media|tts|vip") { return "sound_media" }
  if ($s -match "alert|kofi|tipee") { return "alerts" }
  if ($s -match "communication|bus|event") { return "communication_bus" }
  if ($s -match "dashboard|auth|security") { return "dashboard_admin_security" }
  if ($s -match "obs|scene|overlay") { return "obs_overlay" }
  if ($s -match "twitch|presence|chat") { return "twitch_chat" }
  if ($s -match "discord|tagebuch|todo") { return "discord_tagebuch_todo" }
  if ($s -match "hug|death|clip|shoutout|credits|fireworks|challenge|birthday") { return "stream_features" }
  if ($s -match "diagnostic|health|status|debug") { return "diagnostics" }
  return "other"
}

$missingRouteTriage = @()
foreach ($r in $missingRoutes) {
  $area = Get-RouteArea -Route $r.route -Files $r.files
  $priority = "normal"
  if ($r.route -match "^/api/") { $priority = "high" }
  if ($r.route -match "debug|test|diagnostic|health|status") { $priority = "normal" }
  if ($r.route -match "internal|dev|tmp") { $priority = "low" }

  $missingRouteTriage += [pscustomobject]@{
    area = $area
    priority = $priority
    route = $r.route
    methods = $r.methods
    files = $r.files
    hitCount = $r.hitCount
  }
}

$modulesNoDoc = @($moduleStatus | Where-Object {
  $routeCount = 0
  [int]::TryParse([string]$_.routeHitCount, [ref]$routeCount) | Out-Null
  $hasDoc = ([string]$_.hasMatchingDoc).ToLowerInvariant() -eq "true"
  ($routeCount -gt 0 -and -not $hasDoc)
})

$moduleTriage = @()
foreach ($m in $modulesNoDoc) {
  $area = Get-ModuleArea -File $m.file -Module $m.module
  $routeCount = [int]$m.routeHitCount
  $priority = "normal"
  if ($routeCount -ge 10) { $priority = "high" }
  if ($m.file -match "helper|shared|core") { $priority = "review" }

  $moduleTriage += [pscustomobject]@{
    area = $area
    priority = $priority
    module = $m.module
    file = $m.file
    routeHitCount = $routeCount
  }
}

$routeAreaSummary = @(
  $missingRouteTriage |
    Group-Object area |
    Sort-Object Count -Descending |
    ForEach-Object {
      [pscustomobject]@{
        area = $_.Name
        missingRoutes = $_.Count
        highPriority = @($_.Group | Where-Object { $_.priority -eq "high" }).Count
      }
    }
)

$moduleAreaSummary = @(
  $moduleTriage |
    Group-Object area |
    Sort-Object Count -Descending |
    ForEach-Object {
      [pscustomobject]@{
        area = $_.Name
        modulesWithRoutesNoMatchingDoc = $_.Count
        highPriority = @($_.Group | Where-Object { $_.priority -eq "high" }).Count
        totalRouteHits = (@($_.Group | Measure-Object routeHitCount -Sum).Sum)
      }
    }
)

$topMissingRoutes = @(
  $missingRouteTriage |
    Sort-Object @{Expression="priority";Descending=$false}, area, route |
    Select-Object -First 40
)

$topModules = @(
  $moduleTriage |
    Sort-Object @{Expression="routeHitCount";Descending=$true}, area, module |
    Select-Object -First 40
)

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step592_routes_scan_triage_summary.txt"
$routeAreaPath = Join-Path $OutDir "step592_missing_routes_by_area.tsv"
$moduleAreaPath = Join-Path $OutDir "step592_modules_no_matching_doc_by_area.tsv"
$topRoutesPath = Join-Path $OutDir "step592_top_missing_routes.tsv"
$topModulesPath = Join-Path $OutDir "step592_top_modules_with_routes_no_matching_doc.tsv"
$jsonPath = Join-Path $OutDir "step592_routes_scan_triage.json"

$routeAreaSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $routeAreaPath -Encoding UTF8
$moduleAreaSummary | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $moduleAreaPath -Encoding UTF8
$topMissingRoutes | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $topRoutesPath -Encoding UTF8
$topModules | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $topModulesPath -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    missingRoutesTotal = @($missingRoutes).Count
    missingRouteAreas = @($routeAreaSummary).Count
    highPriorityMissingRoutes = @($missingRouteTriage | Where-Object { $_.priority -eq "high" }).Count
    modulesWithRoutesNoMatchingDoc = @($modulesNoDoc).Count
    moduleAreas = @($moduleAreaSummary).Count
    highPriorityModules = @($moduleTriage | Where-Object { $_.priority -eq "high" }).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  missingRouteAreaSummary = $routeAreaSummary
  moduleAreaSummary = $moduleAreaSummary
  topMissingRoutes = $topMissingRoutes
  topModulesWithRoutesNoMatchingDoc = $topModules
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP592 Routes Scan Results Triage Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Missing routes total: " + @($missingRoutes).Count
$summary += "Missing route areas: " + @($routeAreaSummary).Count
$summary += "High-priority missing routes: " + @($missingRouteTriage | Where-Object { $_.priority -eq "high" }).Count
$summary += "Modules with routes but no matching doc: " + @($modulesNoDoc).Count
$summary += "Module areas: " + @($moduleAreaSummary).Count
$summary += "High-priority modules: " + @($moduleTriage | Where-Object { $_.priority -eq "high" }).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Missing routes by area:"
foreach ($a in $routeAreaSummary) {
  $summary += ("- " + $a.area + ": " + $a.missingRoutes + " missing routes, high=" + $a.highPriority)
}
$summary += ""
$summary += "Modules without matching doc by area:"
foreach ($a in $moduleAreaSummary) {
  $summary += ("- " + $a.area + ": " + $a.modulesWithRoutesNoMatchingDoc + " modules, routeHits=" + $a.totalRouteHits + ", high=" + $a.highPriority)
}
$summary += ""
$summary += "Hinweis:"
$summary += "Die Modul-Doku-Treffer nutzen simple Dateiname-zu-Doku-Logik und enthalten erwartbar False-Positives."
$summary += "Naechster Schritt sollte eine gezielte Doku-Konsolidierung nach Bereichen sein, nicht blindes Erstellen von 45 Modul-Dokus."
if (@($warnings).Count -gt 0) {
  $summary += ""
  $summary += "Warnings:"
  foreach ($w in $warnings) { $summary += "WARN | " + $w }
}
if (@($errors).Count -gt 0) {
  $summary += ""
  $summary += "Errors:"
  foreach ($e in $errors) { $summary += "ERROR | " + $e }
}
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

Write-Host ""
Write-Host "STEP592 Routes Scan Results Triage fertig."
Write-Host ("Missing routes total: " + @($missingRoutes).Count)
Write-Host ("Missing route areas: " + @($routeAreaSummary).Count)
Write-Host ("High-priority missing routes: " + @($missingRouteTriage | Where-Object { $_.priority -eq "high" }).Count)
Write-Host ("Modules with routes but no matching doc: " + @($modulesNoDoc).Count)
Write-Host ("Module areas: " + @($moduleAreaSummary).Count)
Write-Host ("High-priority modules: " + @($moduleTriage | Where-Object { $_.priority -eq "high" }).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Route areas TSV: " + $routeAreaPath)
Write-Host ("Module areas TSV: " + $moduleAreaPath)
Write-Host ("Top missing routes TSV: " + $topRoutesPath)
Write-Host ("Top modules TSV: " + $topModulesPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Missing routes total: " + @($missingRoutes).Count)
Write-Host ("Missing route areas: " + @($routeAreaSummary).Count)
Write-Host ("High-priority missing routes: " + @($missingRouteTriage | Where-Object { $_.priority -eq "high" }).Count)
Write-Host ("Modules with routes but no matching doc: " + @($modulesNoDoc).Count)
Write-Host ("Module areas: " + @($moduleAreaSummary).Count)
Write-Host ("High-priority modules: " + @($moduleTriage | Where-Object { $_.priority -eq "high" }).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
