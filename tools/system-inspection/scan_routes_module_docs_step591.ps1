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

$backendDir = Join-Path $ProjectRoot "backend"
$modulesDir = Join-Path $ProjectRoot "backend\modules"
$docsModulesDir = Join-Path $ProjectRoot "docs\modules"
$currentStatus = Join-Path $ProjectRoot "docs\current\CURRENT_SYSTEM_STATUS.md"
$filesDoc = Join-Path $ProjectRoot "project-state\FILES.md"

$errors = @()
$warnings = @()

function To-Rel {
  param([string]$FullPath)
  $full = [System.IO.Path]::GetFullPath($FullPath)
  $rootFull = [System.IO.Path]::GetFullPath($ProjectRoot)
  return $full.Substring($rootFull.Length).TrimStart("\").Replace("\", "/")
}

function Safe-Read {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return "" }
  return Get-Content -LiteralPath $Path -Raw -Encoding UTF8
}

function Add-RouteHit {
  param(
    [string]$FileRel,
    [int]$Line,
    [string]$Method,
    [string]$Path,
    [string]$Pattern,
    [string]$Raw
  )
  return [pscustomobject]@{
    file = $FileRel
    line = $Line
    method = $Method.ToUpperInvariant()
    route = $Path
    pattern = $Pattern
    raw = $Raw.Trim()
  }
}

$jsFiles = @()
if (Test-Path -LiteralPath $backendDir) {
  $jsFiles = @(Get-ChildItem -LiteralPath $backendDir -Recurse -File -Include "*.js" | Sort-Object FullName)
} else {
  $errors += "backend directory missing"
}

$routeHits = @()

# Patterns:
# app.get('/api/x'
# router.post("/x"
# registerGet('/api/x'
# routes.get('/x'
# helper_routes style may vary, so we also catch quoted /api/... on lines containing route-ish keywords.
$mainPatterns = @(
  [pscustomobject]@{ name="express_app"; regex='(?i)\b(app|router|routes)\s*\.\s*(get|post|put|delete|patch|options|head|all|use)\s*\(\s*["'']([^"'']+)["'']' },
  [pscustomobject]@{ name="register_method"; regex='(?i)\b(registerRoute|registerGet|registerPost|registerPut|registerDelete|registerPatch|addRoute|addGet|addPost|route)\s*\(\s*["'']([^"'']+)["'']' },
  [pscustomobject]@{ name="object_method_path"; regex='(?i)\bmethod\s*:\s*["''](GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)["''].*?\bpath\s*:\s*["'']([^"'']+)["'']' },
  [pscustomobject]@{ name="object_path_method"; regex='(?i)\bpath\s*:\s*["'']([^"'']+)["''].*?\bmethod\s*:\s*["''](GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)["'']' },
  [pscustomobject]@{ name="api_string_routeish"; regex='(?i)["''](/api/[^"'']+)["'']' }
)

foreach ($file in $jsFiles) {
  $rel = To-Rel $file.FullName
  $lines = Get-Content -LiteralPath $file.FullName -Encoding UTF8
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match '^\s*//') { continue }

    foreach ($p in $mainPatterns) {
      if ($line -match $p.regex) {
        $method = "UNKNOWN"
        $path = ""

        if ($p.name -eq "express_app") {
          $method = $matches[2].ToUpperInvariant()
          $path = $matches[3]
        } elseif ($p.name -eq "register_method") {
          $fn = $matches[1]
          $path = $matches[2]
          if ($fn -match '(?i)Get') { $method = "GET" }
          elseif ($fn -match '(?i)Post') { $method = "POST" }
          elseif ($fn -match '(?i)Put') { $method = "PUT" }
          elseif ($fn -match '(?i)Delete') { $method = "DELETE" }
          elseif ($fn -match '(?i)Patch') { $method = "PATCH" }
        } elseif ($p.name -eq "object_method_path") {
          $method = $matches[1].ToUpperInvariant()
          $path = $matches[2]
        } elseif ($p.name -eq "object_path_method") {
          $path = $matches[1]
          $method = $matches[2].ToUpperInvariant()
        } elseif ($p.name -eq "api_string_routeish") {
          $path = $matches[1]
          if ($line -match '(?i)\b(get|post|put|delete|patch|options|head)\b') {
            $method = $matches[1].ToUpperInvariant()
          }
        }

        if (-not [string]::IsNullOrWhiteSpace($path)) {
          $routeHits += Add-RouteHit -FileRel $rel -Line ($i + 1) -Method $method -Path $path -Pattern $p.name -Raw $line
        }
      }
    }
  }
}

# De-duplicate route hits by file/line/method/route/pattern.
$routeHits = @($routeHits | Sort-Object file,line,method,route,pattern -Unique)

$routesByPath = @{}
foreach ($r in $routeHits) {
  if (-not $routesByPath.ContainsKey($r.route)) {
    $routesByPath[$r.route] = @()
  }
  $routesByPath[$r.route] += $r
}

$docsFiles = @()
if (Test-Path -LiteralPath $docsModulesDir) {
  $docsFiles += @(Get-ChildItem -LiteralPath $docsModulesDir -Recurse -File -Include "*.md")
} else {
  $warnings += "docs/modules directory missing"
}
if (Test-Path -LiteralPath $currentStatus) { $docsFiles += Get-Item -LiteralPath $currentStatus }
if (Test-Path -LiteralPath $filesDoc) { $docsFiles += Get-Item -LiteralPath $filesDoc }

$docsText = ""
foreach ($doc in $docsFiles) {
  $docsText += "`n---FILE:" + (To-Rel $doc.FullName) + "---`n"
  $docsText += Safe-Read $doc.FullName
}

$routeDocStatus = @()
foreach ($route in ($routesByPath.Keys | Sort-Object)) {
  $escaped = [regex]::Escape($route)
  $mentioned = $false
  if ($docsText -match $escaped) { $mentioned = $true }

  $hits = @($routesByPath[$route])
  $files = @($hits | Select-Object -ExpandProperty file -Unique)
  $methods = @($hits | Select-Object -ExpandProperty method -Unique)

  $routeDocStatus += [pscustomobject]@{
    route = $route
    mentionedInDocs = $mentioned
    methods = ($methods -join ",")
    files = ($files -join ",")
    hitCount = $hits.Count
  }
}

$missingDocs = @($routeDocStatus | Where-Object { -not $_.mentionedInDocs })

# Module files with no direct matching docs by simple basename.
$moduleDocNames = @{}
foreach ($doc in $docsFiles) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($doc.Name).ToLowerInvariant()
  $moduleDocNames[$name] = $true
}

$moduleDocStatus = @()
foreach ($file in $jsFiles) {
  $rel = To-Rel $file.FullName
  if ($rel -notlike "backend/modules/*") { continue }
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToLowerInvariant()
  $hasDoc = $moduleDocNames.ContainsKey($baseName)
  $routeCount = @($routeHits | Where-Object { $_.file -eq $rel }).Count
  $moduleDocStatus += [pscustomobject]@{
    file = $rel
    module = $baseName
    hasMatchingDoc = $hasDoc
    routeHitCount = $routeCount
  }
}

$modulesWithRoutesNoDoc = @($moduleDocStatus | Where-Object { $_.routeHitCount -gt 0 -and -not $_.hasMatchingDoc })

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path $OutDir "step591_routes_module_docs_verification_summary.txt"
$routesPath = Join-Path $OutDir "step591_detected_routes.tsv"
$missingPath = Join-Path $OutDir "step591_routes_missing_doc_mentions.tsv"
$modulesPath = Join-Path $OutDir "step591_module_doc_status.tsv"
$jsonPath = Join-Path $OutDir "step591_routes_module_docs_verification.json"

$routeHits | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $routesPath -Encoding UTF8
$missingDocs | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $missingPath -Encoding UTF8
$moduleDocStatus | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $modulesPath -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    backendJsFilesScanned = @($jsFiles).Count
    routeHits = @($routeHits).Count
    uniqueRoutes = @($routesByPath.Keys).Count
    routesMentionedInDocs = @($routeDocStatus | Where-Object { $_.mentionedInDocs }).Count
    routesMissingDocMention = @($missingDocs).Count
    moduleFilesChecked = @($moduleDocStatus).Count
    moduleFilesWithRoutesNoMatchingDoc = @($modulesWithRoutesNoDoc).Count
    docsFilesChecked = @($docsFiles).Count
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  routes = $routeHits
  routeDocStatus = $routeDocStatus
  routesMissingDocMention = $missingDocs
  moduleDocStatus = $moduleDocStatus
  modulesWithRoutesNoMatchingDoc = $modulesWithRoutesNoDoc
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP591 Routes and Module Docs Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Backend JS files scanned: " + @($jsFiles).Count
$summary += "Route hits: " + @($routeHits).Count
$summary += "Unique routes: " + @($routesByPath.Keys).Count
$summary += "Routes mentioned in docs: " + @($routeDocStatus | Where-Object { $_.mentionedInDocs }).Count
$summary += "Routes missing doc mention: " + @($missingDocs).Count
$summary += "Module files checked: " + @($moduleDocStatus).Count
$summary += "Module files with routes but no matching doc: " + @($modulesWithRoutesNoDoc).Count
$summary += "Docs files checked: " + @($docsFiles).Count
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Hinweis:"
$summary += "Dieser Scan ist ein konservativer Regex-/Doku-Mention-Scan. Treffer muessen vor Doku-Aenderungen fachlich geprueft werden."
$summary += "Er dokumentiert keine Routen automatisch und nimmt keine Code-Aenderungen vor."
$summary += ""
if (@($warnings).Count -gt 0) {
  $summary += "Warnings:"
  foreach ($w in $warnings) { $summary += "WARN | " + $w }
}
if (@($errors).Count -gt 0) {
  $summary += "Errors:"
  foreach ($e in $errors) { $summary += "ERROR | " + $e }
}
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

Write-Host ""
Write-Host "STEP591 Routes and Module Docs Verification fertig."
Write-Host ("Backend JS files scanned: " + @($jsFiles).Count)
Write-Host ("Route hits: " + @($routeHits).Count)
Write-Host ("Unique routes: " + @($routesByPath.Keys).Count)
Write-Host ("Routes mentioned in docs: " + @($routeDocStatus | Where-Object { $_.mentionedInDocs }).Count)
Write-Host ("Routes missing doc mention: " + @($missingDocs).Count)
Write-Host ("Module files checked: " + @($moduleDocStatus).Count)
Write-Host ("Module files with routes but no matching doc: " + @($modulesWithRoutesNoDoc).Count)
Write-Host ("Docs files checked: " + @($docsFiles).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Routes TSV: " + $routesPath)
Write-Host ("Missing docs TSV: " + $missingPath)
Write-Host ("Module docs TSV: " + $modulesPath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Backend JS files scanned: " + @($jsFiles).Count)
Write-Host ("Route hits: " + @($routeHits).Count)
Write-Host ("Unique routes: " + @($routesByPath.Keys).Count)
Write-Host ("Routes mentioned in docs: " + @($routeDocStatus | Where-Object { $_.mentionedInDocs }).Count)
Write-Host ("Routes missing doc mention: " + @($missingDocs).Count)
Write-Host ("Module files checked: " + @($moduleDocStatus).Count)
Write-Host ("Module files with routes but no matching doc: " + @($modulesWithRoutesNoDoc).Count)
Write-Host ("Docs files checked: " + @($docsFiles).Count)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
