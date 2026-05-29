param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path $ProjectRoot "system-scan-output"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Get-RelativePathSafe {
  param(
    [string]$BasePath,
    [string]$FullPath
  )

  $baseResolved = (Resolve-Path $BasePath).Path.TrimEnd("\")
  $fullResolved = (Resolve-Path $FullPath).Path

  if ($fullResolved.StartsWith($baseResolved, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $fullResolved.Substring($baseResolved.Length).TrimStart("\")
  }

  return $FullPath
}

function Read-TextSafe {
  param([string]$Path)

  try {
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -gt 900000) {
      return ""
    }

    return [System.Text.Encoding]::UTF8.GetString($bytes)
  } catch {
    return ""
  }
}

function Count-TodoHits {
  param([string]$Content)

  $count = 0
  $markers = @(
    "todo",
    "fixme",
    "offen",
    "open",
    "next step",
    "next_steps",
    "known issue",
    "known_issues",
    "prüfen",
    "pruefen",
    "später",
    "spaeter",
    "follow-up",
    "followup",
    "noch zu tun",
    "muss noch",
    "pending",
    "bewusst offen"
  )

  foreach ($line in ($Content -split "`n")) {
    $lower = $line.ToLowerInvariant()
    foreach ($marker in $markers) {
      if ($lower.Contains($marker)) {
        $count++
        break
      }
    }
  }

  return $count
}

function Get-Theme {
  param([string]$RelativePath)

  $p = $RelativePath.Replace("\", "/").ToLowerInvariant()

  if ($p -match "alert") { return "alerts" }
  if ($p -match "sound|soundbus|mediaid|discord_media") { return "sound_media" }
  if ($p -match "dashboard") { return "dashboard" }
  if ($p -match "vip") { return "vip" }
  if ($p -match "overlay") { return "overlay" }
  if ($p -match "communication|bus") { return "communication_bus" }
  if ($p -match "birthday") { return "birthday" }
  if ($p -match "clip") { return "clips" }

  return "misc"
}

function Get-CandidateKind {
  param([string]$RelativePath)

  $p = $RelativePath.Replace("\", "/").ToLowerInvariant()

  if ($p.StartsWith("docs/backend/")) { return "backend_step_doc" }
  if ($p.StartsWith("docs/dashboard/")) { return "dashboard_step_doc" }
  if ($p.StartsWith("docs/vip/")) { return "vip_step_doc" }
  if ($p.StartsWith("docs/overlays/")) { return "overlay_step_doc" }
  if ($p.StartsWith("docs/media/")) { return "media_step_doc" }
  if ($p.StartsWith("docs/sound_system/")) { return "sound_system_handoff_doc" }
  if ($p -match "^docs/readme_step") { return "readme_step_doc" }
  if ($p -match "^docs/step[0-9]+") { return "root_step_doc" }

  return "unknown"
}

Write-Host "Scanne technische STEP-Dokus: $ProjectRoot"
Write-Host "Ausgabe: $OutDir"

$allFiles = Get-ChildItem -Path (Join-Path $ProjectRoot "docs") -Recurse -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in @(".md", ".txt", ".csv")
  }

$candidates = @()

foreach ($file in $allFiles) {
  $rel = Get-RelativePathSafe -BasePath $ProjectRoot -FullPath $file.FullName
  $relNorm = $rel.Replace("\", "/")
  $p = $relNorm.ToLowerInvariant()

  # Archive and generated docs are intentionally skipped in this cleanup batch.
  if ($p.StartsWith("docs/archive/")) { continue }
  if ($p.StartsWith("docs/_generated/")) { continue }

  $isCandidate = $false

  if ($p.StartsWith("docs/backend/") -and $p -match "step[0-9]+") { $isCandidate = $true }
  if ($p.StartsWith("docs/dashboard/") -and $p -match "step[0-9]+") { $isCandidate = $true }
  if ($p.StartsWith("docs/vip/") -and $p -match "step[0-9]+") { $isCandidate = $true }
  if ($p.StartsWith("docs/overlays/") -and $p -match "step[0-9]+") { $isCandidate = $true }
  if ($p.StartsWith("docs/media/") -and $p -match "step[0-9]+") { $isCandidate = $true }
  if ($p.StartsWith("docs/sound_system/") -and $p -match "handoff|stable") { $isCandidate = $true }
  if ($p -match "^docs/readme_step[0-9]+") { $isCandidate = $true }
  if ($p -match "^docs/step[0-9]+") { $isCandidate = $true }

  if (-not $isCandidate) { continue }

  $content = Read-TextSafe -Path $file.FullName
  $todoCount = Count-TodoHits -Content $content
  $theme = Get-Theme -RelativePath $relNorm
  $kind = Get-CandidateKind -RelativePath $relNorm

  $candidates += [pscustomobject]@{
    path = $relNorm
    bytes = $file.Length
    modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    kind = $kind
    theme = $theme
    todoHits = $todoCount
  }
}

$candidates = $candidates | Sort-Object kind, theme, path

$summary = [pscustomobject]@{
  generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  projectRoot = $ProjectRoot
  candidates = @($candidates).Count
  todoHits = (($candidates | Measure-Object -Property todoHits -Sum).Sum)
}

$jsonPath = Join-Path $OutDir "step535_tech_step_docs_scan.json"
$summaryPath = Join-Path $OutDir "step535_tech_step_docs_summary.txt"
$candidatesPath = Join-Path $OutDir "step535_tech_step_docs_candidates.txt"
$groupedPath = Join-Path $OutDir "step535_tech_step_docs_grouped.txt"

[pscustomobject]@{
  summary = $summary
  candidates = $candidates
} | ConvertTo-Json -Depth 20 | Out-File $jsonPath -Encoding utf8

$summaryLines = @()
$summaryLines += "STEP535 Technical STEP Docs Scan"
$summaryLines += ("Generated: " + $summary.generatedAt)
$summaryLines += ("ProjectRoot: " + $summary.projectRoot)
$summaryLines += ("Candidates: " + $summary.candidates)
$summaryLines += ("TODO hits: " + $summary.todoHits)
$summaryLines += ""
$summaryLines += "Scope:"
$summaryLines += "- docs/backend/*STEP*"
$summaryLines += "- docs/dashboard/*STEP*"
$summaryLines += "- docs/vip/STEP*"
$summaryLines += "- docs/overlays/STEP*"
$summaryLines += "- docs/media/*STEP*"
$summaryLines += "- docs/README_STEP*"
$summaryLines += "- docs/STEP*"
$summaryLines += ""
$summaryLines += "Excluded intentionally:"
$summaryLines += "- docs/archive/*"
$summaryLines += "- docs/_generated/*"
$summaryLines += "- docs/modules/*"
$summaryLines += "- docs/current/*"
$summaryLines += ""
$summaryLines += "Rule:"
$summaryLines += "- Nothing deleted."
$summaryLines += "- Review grouped report first."
$summaryLines += "- Build consolidation docs by theme before quarantine."
$summaryLines | Out-File $summaryPath -Encoding utf8

$candidateLines = @()
$candidateLines += "STEP535 Technical STEP Docs Candidates"
$candidateLines += "Nur Kandidaten. Nicht automatisch loeschen."
$candidateLines += ""

foreach ($c in $candidates) {
  $candidateLines += ($c.path + " | kind=" + $c.kind + " | theme=" + $c.theme + " | todoHits=" + $c.todoHits + " | bytes=" + $c.bytes)
}
$candidateLines | Out-File $candidatesPath -Encoding utf8

$groupedLines = @()
$groupedLines += "STEP535 Technical STEP Docs grouped by theme/kind"
$groupedLines += ""

$groups = $candidates | Group-Object theme, kind | Sort-Object Name
foreach ($g in $groups) {
  $groupedLines += ("## " + $g.Name + " | files=" + $g.Count)
  foreach ($item in ($g.Group | Sort-Object path)) {
    $groupedLines += ("- " + $item.path + " | todoHits=" + $item.todoHits + " | bytes=" + $item.bytes)
  }
  $groupedLines += ""
}
$groupedLines | Out-File $groupedPath -Encoding utf8

Write-Host ""
Write-Host "STEP535 Scan fertig."
Write-Host ("JSON: " + $jsonPath)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Candidates: " + $candidatesPath)
Write-Host ("Grouped: " + $groupedPath)
