param(
  [string]$ProjectRoot = 'D:\Git\stream-control-center',
  [string]$OutDir = ''
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $ProjectRoot)) {
  throw ('Projektpfad nicht gefunden: ' + $ProjectRoot)
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path $ProjectRoot 'system-scan-output'
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$ignoredDirectoryRegex = '\\(\.git|node_modules|data\\sqlite|data\\backups|secrets|archive|coverage|dist|build|\.idea|\.vscode)(\\|$)'
$ignoredFileExtensions = @(
  '.zip', '.7z', '.rar',
  '.sqlite', '.db',
  '.log',
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico',
  '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.mov',
  '.exe', '.dll'
)

function Get-RelativePathSafe {
  param(
    [string]$BasePath,
    [string]$FullPath
  )

  $baseResolved = (Resolve-Path $BasePath).Path.TrimEnd('\')
  $fullResolved = (Resolve-Path $FullPath).Path

  if ($fullResolved.StartsWith($baseResolved, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $fullResolved.Substring($baseResolved.Length).TrimStart('\')
  }

  return $FullPath
}

function Read-TextSafe {
  param([string]$Path)

  try {
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -gt 800000) {
      return ''
    }

    return [System.Text.Encoding]::UTF8.GetString($bytes)
  } catch {
    return ''
  }
}

function Add-Tag {
  param(
    [System.Collections.Generic.List[string]]$Tags,
    [string]$Tag
  )

  if (-not $Tags.Contains($Tag)) {
    $Tags.Add($Tag) | Out-Null
  }
}

function Get-SystemTags {
  param(
    [string]$RelativePath,
    [string]$Content
  )

  $tags = New-Object System.Collections.Generic.List[string]

  $p = $RelativePath.Replace('\', '/').ToLowerInvariant()
  $c = $Content.ToLowerInvariant()

  if ($p.StartsWith('backend/modules/')) { Add-Tag $tags 'BACKEND_MODULE' }
  if ($p.StartsWith('backend/modules/helpers/')) { Add-Tag $tags 'HELPER' }
  if ($p.StartsWith('backend/core/')) { Add-Tag $tags 'BACKEND_CORE' }
  if ($p.StartsWith('config/')) { Add-Tag $tags 'CONFIG' }
  if ($p.StartsWith('htdocs/dashboard/')) { Add-Tag $tags 'DASHBOARD' }
  if ($p.StartsWith('htdocs/overlays/')) { Add-Tag $tags 'OVERLAY' }
  if ($p.StartsWith('htdocs/public/')) { Add-Tag $tags 'PUBLIC_TOOL' }
  if ($p.StartsWith('docs/')) { Add-Tag $tags 'DOCS' }
  if ($p.StartsWith('project-state/')) { Add-Tag $tags 'PROJECT_STATE' }
  if ($p.StartsWith('tools/')) { Add-Tag $tags 'TOOLS' }

  if ($p -match 'communication_bus|eventbus|event_bus' -or $c -match 'communication_bus|eventbus|event bus') { Add-Tag $tags 'EVENTBUS' }
  if ($p -match 'sound|audio|tts|voice' -or $c -match 'sound_system|sound-system|sound system|tts|audio') { Add-Tag $tags 'SOUND_SYSTEM' }
  if ($p -match 'alert') { Add-Tag $tags 'ALERTS' }
  if ($p -match 'channelpoints|redemption|reward') { Add-Tag $tags 'CHANNELPOINTS' }
  if ($p -match 'twitch|eventsub|helix') { Add-Tag $tags 'TWITCH' }
  if ($p -match 'discord') { Add-Tag $tags 'DISCORD' }
  if ($p -match 'obs|scene') { Add-Tag $tags 'OBS' }
  if ($p -match 'tagebuch') { Add-Tag $tags 'TAGEBUCH' }
  if ($p -match 'todo') { Add-Tag $tags 'TODO' }
  if ($p -match 'hug|rehug') { Add-Tag $tags 'HUG' }
  if ($p -match 'clip') { Add-Tag $tags 'CLIPS' }
  if ($p -match 'deathcounter|death_counter') { Add-Tag $tags 'DEATHCOUNTER' }
  if ($p -match 'challenge|nichtfluchen|nichtreden') { Add-Tag $tags 'CHALLENGES' }
  if ($p -match 'security|auth|permission|role') { Add-Tag $tags 'SECURITY' }
  if ($p -match 'sqlite|database|db') { Add-Tag $tags 'DATABASE' }
  if ($p -match 'media|asset|upload') { Add-Tag $tags 'MEDIA' }

  if ($p -match 'test|debug|demo|sample|backup|old|legacy|tmp|temp|copy|unused|archive|obsolete|wip') { Add-Tag $tags 'CLEANUP_CANDIDATE_BY_NAME' }
  if ($c -match 'todo|fixme|deprecated|obsolete|not use|nicht verwenden|zurueckgezogen|zurückgezogen|legacy|temporary|temporarily|cleanup|remove later') { Add-Tag $tags 'REVIEW_MARKER_IN_CONTENT' }

  return @($tags)
}

function Get-RoutesSimple {
  param([string]$Content)

  $routes = New-Object System.Collections.Generic.List[string]
  $lines = $Content -split "`n"

  foreach ($line in $lines) {
    $trim = $line.Trim()
    $method = ''

    if ($trim.StartsWith('app.get(') -or $trim.StartsWith('router.get(')) { $method = 'GET' }
    elseif ($trim.StartsWith('app.post(') -or $trim.StartsWith('router.post(')) { $method = 'POST' }
    elseif ($trim.StartsWith('app.put(') -or $trim.StartsWith('router.put(')) { $method = 'PUT' }
    elseif ($trim.StartsWith('app.patch(') -or $trim.StartsWith('router.patch(')) { $method = 'PATCH' }
    elseif ($trim.StartsWith('app.delete(') -or $trim.StartsWith('router.delete(')) { $method = 'DELETE' }

    if ($method -eq '') { continue }

    $single = [char]39
    $double = [char]34
    $firstSingle = $trim.IndexOf($single)
    $firstDouble = $trim.IndexOf($double)

    $quoteIndex = -1
    $quoteChar = $null

    if ($firstSingle -ge 0 -and ($firstDouble -lt 0 -or $firstSingle -lt $firstDouble)) {
      $quoteIndex = $firstSingle
      $quoteChar = $single
    } elseif ($firstDouble -ge 0) {
      $quoteIndex = $firstDouble
      $quoteChar = $double
    }

    if ($quoteIndex -lt 0) { continue }

    $endQuote = $trim.IndexOf($quoteChar, $quoteIndex + 1)
    if ($endQuote -le $quoteIndex) { continue }

    $route = $trim.Substring($quoteIndex + 1, $endQuote - $quoteIndex - 1)
    if ([string]::IsNullOrWhiteSpace($route)) { continue }

    $entry = $method + ' ' + $route
    if (-not $routes.Contains($entry)) {
      $routes.Add($entry) | Out-Null
    }
  }

  return @($routes)
}

function Get-RequiresSimple {
  param([string]$Content)

  $requires = New-Object System.Collections.Generic.List[string]
  $lines = $Content -split "`n"

  foreach ($line in $lines) {
    if ($line.IndexOf('require(') -lt 0 -and $line.IndexOf('require (') -lt 0) { continue }

    $single = [char]39
    $double = [char]34
    $firstSingle = $line.IndexOf($single)
    $firstDouble = $line.IndexOf($double)

    $quoteIndex = -1
    $quoteChar = $null

    if ($firstSingle -ge 0 -and ($firstDouble -lt 0 -or $firstSingle -lt $firstDouble)) {
      $quoteIndex = $firstSingle
      $quoteChar = $single
    } elseif ($firstDouble -ge 0) {
      $quoteIndex = $firstDouble
      $quoteChar = $double
    }

    if ($quoteIndex -lt 0) { continue }

    $endQuote = $line.IndexOf($quoteChar, $quoteIndex + 1)
    if ($endQuote -le $quoteIndex) { continue }

    $req = $line.Substring($quoteIndex + 1, $endQuote - $quoteIndex - 1)
    if ([string]::IsNullOrWhiteSpace($req)) { continue }

    if (-not $requires.Contains($req)) {
      $requires.Add($req) | Out-Null
    }
  }

  return @($requires)
}

Write-Host ('Scanne Projekt: ' + $ProjectRoot)
Write-Host ('Ausgabe: ' + $OutDir)

$allFiles = Get-ChildItem -Path $ProjectRoot -Recurse -File |
  Where-Object {
    $_.FullName -notmatch $ignoredDirectoryRegex -and
    $ignoredFileExtensions -notcontains $_.Extension.ToLowerInvariant()
  } |
  Sort-Object FullName

$items = New-Object System.Collections.Generic.List[object]

foreach ($file in $allFiles) {
  $rel = Get-RelativePathSafe -BasePath $ProjectRoot -FullPath $file.FullName
  $relNorm = $rel.Replace('\', '/')
  $content = Read-TextSafe -Path $file.FullName
  $tags = @(Get-SystemTags -RelativePath $rel -Content $content)
  $routes = @(Get-RoutesSimple -Content $content)
  $requires = @(Get-RequiresSimple -Content $content)

  $items.Add([pscustomobject]@{
    path = $relNorm
    extension = $file.Extension
    sizeBytes = $file.Length
    modified = $file.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
    tags = $tags
    routes = $routes
    requires = $requires
  }) | Out-Null
}

$summary = [pscustomobject]@{
  generatedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
  projectRoot = $ProjectRoot
  fileCount = $items.Count
  backendModules = @($items | Where-Object { $_.tags -contains 'BACKEND_MODULE' }).Count
  helpers = @($items | Where-Object { $_.tags -contains 'HELPER' }).Count
  dashboardFiles = @($items | Where-Object { $_.tags -contains 'DASHBOARD' }).Count
  overlayFiles = @($items | Where-Object { $_.tags -contains 'OVERLAY' }).Count
  configFiles = @($items | Where-Object { $_.tags -contains 'CONFIG' }).Count
  docsFiles = @($items | Where-Object { $_.tags -contains 'DOCS' }).Count
  cleanupCandidates = @($items | Where-Object { $_.tags -contains 'CLEANUP_CANDIDATE_BY_NAME' -or $_.tags -contains 'REVIEW_MARKER_IN_CONTENT' }).Count
  eventBusFiles = @($items | Where-Object { $_.tags -contains 'EVENTBUS' }).Count
  soundSystemFiles = @($items | Where-Object { $_.tags -contains 'SOUND_SYSTEM' }).Count
}

$inventory = [pscustomobject]@{
  summary = $summary
  files = $items
}

$inventoryJsonPath = Join-Path $OutDir 'system_inventory.json'
$fileListPath = Join-Path $OutDir 'file_list.txt'
$routesPath = Join-Path $OutDir 'routes_inventory.txt'
$cleanupPath = Join-Path $OutDir 'cleanup_candidates.txt'
$importantPath = Join-Path $OutDir 'important_files_by_system.txt'
$summaryPath = Join-Path $OutDir 'scan_summary.txt'

$inventory | ConvertTo-Json -Depth 20 | Out-File $inventoryJsonPath -Encoding utf8

$summaryLines = @()
$summaryLines += 'System Scan Summary'
$summaryLines += ('Generated: ' + $summary.generatedAt)
$summaryLines += ('ProjectRoot: ' + $summary.projectRoot)
$summaryLines += ('Files: ' + $summary.fileCount)
$summaryLines += ('Backend modules: ' + $summary.backendModules)
$summaryLines += ('Helpers: ' + $summary.helpers)
$summaryLines += ('Dashboard files: ' + $summary.dashboardFiles)
$summaryLines += ('Overlay files: ' + $summary.overlayFiles)
$summaryLines += ('Config files: ' + $summary.configFiles)
$summaryLines += ('Docs files: ' + $summary.docsFiles)
$summaryLines += ('EventBus tagged files: ' + $summary.eventBusFiles)
$summaryLines += ('Sound-System tagged files: ' + $summary.soundSystemFiles)
$summaryLines += ('Cleanup candidates: ' + $summary.cleanupCandidates)
$summaryLines | Out-File $summaryPath -Encoding utf8

$fileLines = @()
foreach ($item in $items) {
  $fileLines += ($item.path + ' | tags=' + ($item.tags -join ', '))
}
$fileLines | Out-File $fileListPath -Encoding utf8

$routeLines = @()
foreach ($item in $items) {
  foreach ($route in $item.routes) {
    $routeLines += ($item.path + ' | ' + $route)
  }
}
$routeLines | Out-File $routesPath -Encoding utf8

$cleanupLines = @()
$cleanupLines += 'Nur Kandidaten. Nichts daraus automatisch loeschen.'
foreach ($item in $items) {
  if ($item.tags -contains 'CLEANUP_CANDIDATE_BY_NAME' -or $item.tags -contains 'REVIEW_MARKER_IN_CONTENT') {
    $cleanupLines += ($item.path + ' | tags=' + ($item.tags -join ', '))
  }
}
$cleanupLines | Out-File $cleanupPath -Encoding utf8

$systems = @(
  'BACKEND_CORE', 'BACKEND_MODULE', 'HELPER', 'CONFIG', 'DASHBOARD', 'OVERLAY',
  'EVENTBUS', 'SOUND_SYSTEM', 'ALERTS', 'CHANNELPOINTS', 'TWITCH', 'DISCORD',
  'OBS', 'TAGEBUCH', 'TODO', 'HUG', 'CLIPS', 'DEATHCOUNTER', 'CHALLENGES',
  'SECURITY', 'DATABASE', 'MEDIA', 'DOCS', 'PROJECT_STATE', 'TOOLS'
)

$importantLines = @()
foreach ($system in $systems) {
  $matches = @($items | Where-Object { $_.tags -contains $system })
  if ($matches.Count -eq 0) { continue }

  $importantLines += ''
  $importantLines += ('[' + $system + ']')

  foreach ($item in $matches) {
    $importantLines += $item.path
  }
}
$importantLines | Out-File $importantPath -Encoding utf8

Write-Host ''
Write-Host 'Fertig.'
Write-Host 'Erzeugt:'
Write-Host ('- ' + $inventoryJsonPath)
Write-Host ('- ' + $summaryPath)
Write-Host ('- ' + $fileListPath)
Write-Host ('- ' + $routesPath)
Write-Host ('- ' + $cleanupPath)
Write-Host ('- ' + $importantPath)
