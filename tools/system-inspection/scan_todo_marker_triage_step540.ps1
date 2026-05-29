param(
  [string]$ProjectRoot = "D:\Git\stream-control-center",
  [string]$OutDir = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $ProjectRoot)) {
  throw "Projektpfad nicht gefunden: $ProjectRoot"
}

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path -Path $ProjectRoot -ChildPath "system-scan-output"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Get-Rel {
  param([string]$BasePath, [string]$FullPath)
  $baseResolved = (Resolve-Path $BasePath).Path.TrimEnd("\")
  $fullResolved = (Resolve-Path $FullPath).Path
  if ($fullResolved.StartsWith($baseResolved, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $fullResolved.Substring($baseResolved.Length).TrimStart("\").Replace("\", "/")
  }
  return $FullPath.Replace("\", "/")
}

function Read-TextSafe {
  param([string]$Path)
  try {
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    if ($bytes.Length -gt 2000000) { return "" }
    return [System.Text.Encoding]::UTF8.GetString($bytes)
  } catch {
    return ""
  }
}

function Classify-Path {
  param([string]$RelPath)

  $p = $RelPath.ToLowerInvariant()

  if ($p.StartsWith("docs/system-inspection/")) { return "system_inspection_reports" }
  if ($p.StartsWith("project-state/")) { return "project_state" }
  if ($p.StartsWith("docs/modules/")) { return "module_docs" }
  if ($p.StartsWith("docs/current/")) { return "current_docs" }
  if ($p.StartsWith("docs/database/")) { return "database_docs" }
  if ($p.StartsWith("docs/backend/")) { return "backend_docs" }
  if ($p.StartsWith("docs/dashboard/")) { return "dashboard_docs" }
  if ($p.StartsWith("docs/settings/")) { return "settings_docs" }
  if ($p.StartsWith("docs/sound_system/")) { return "sound_system_docs" }
  if ($p.StartsWith("docs/user/")) { return "user_docs" }

  return "other_docs"
}

function Classify-MarkerLine {
  param([string]$Line, [string]$RelPath)

  $lower = $Line.ToLowerInvariant()
  $pathLower = $RelPath.ToLowerInvariant()

  if ($pathLower.Contains("todo") -and ($lower.Contains("todo") -or $lower.Contains("to-do"))) {
    return "name_context_todo"
  }

  if ($lower -match "^\s*[-*]\s+\[[ xX]\]") {
    return "checklist"
  }

  if ($lower.Contains("bewusst nicht") -or $lower.Contains("bewusst offen") -or $lower.Contains("nicht umgesetzt") -or $lower.Contains("nicht enthalten")) {
    return "intentional_scope_note"
  }

  if ($lower.Contains("known issue") -or $lower.Contains("known_issues") -or $lower.Contains("bekanntes problem")) {
    return "known_issue"
  }

  if ($lower.Contains("next step") -or $lower.Contains("next_steps") -or $lower.Contains("nächster schritt") -or $lower.Contains("naechster schritt")) {
    return "next_step"
  }

  if ($lower.Contains("todo") -or $lower.Contains("to-do") -or $lower.Contains("fixme") -or $lower.Contains("pending") -or $lower.Contains("muss noch") -or $lower.Contains("offen")) {
    return "potential_action_item"
  }

  if ($lower.Contains("später") -or $lower.Contains("spaeter") -or $lower.Contains("follow-up")) {
    return "future_note"
  }

  return "other_marker"
}

$includeRoots = @()
$includeRoots += (Join-Path -Path $ProjectRoot -ChildPath "docs")
$includeRoots += (Join-Path -Path $ProjectRoot -ChildPath "project-state")

$files = @()
foreach ($r in $includeRoots) {
  if (Test-Path $r) {
    $files += Get-ChildItem -Path $r -Recurse -File |
      Where-Object { $_.Extension.ToLowerInvariant() -in @(".md", ".txt", ".csv") }
  }
}

$markerTerms = @(
  "todo", "to-do", "fixme", "offen", "known issue", "known_issues",
  "next step", "next_steps", "nächster schritt", "naechster schritt",
  "später", "spaeter", "follow-up", "muss noch", "pending",
  "bewusst offen", "nicht umgesetzt", "nicht enthalten"
)

$hits = @()

foreach ($file in $files) {
  $rel = Get-Rel -BasePath $ProjectRoot -FullPath $file.FullName
  $p = $rel.ToLowerInvariant()

  if ($p.StartsWith("docs/archive/")) { continue }
  if ($p.StartsWith("docs/_generated/")) { continue }
  if ($p.StartsWith("project-state/archive/")) { continue }

  $content = Read-TextSafe -Path $file.FullName
  if ([string]::IsNullOrWhiteSpace($content)) { continue }

  $lines = $content -split "`n"
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i].TrimEnd()
    $lower = $line.ToLowerInvariant()

    $matched = $false
    foreach ($term in $markerTerms) {
      if ($lower.Contains($term)) {
        $matched = $true
        break
      }
    }

    if (-not $matched) { continue }

    $hits += [pscustomobject]@{
      path = $rel
      line = ($i + 1)
      bucket = Classify-Path -RelPath $rel
      markerType = Classify-MarkerLine -Line $line -RelPath $rel
      text = $line
      bytes = $file.Length
    }
  }
}

$fileSummary = @(
  $hits |
    Group-Object path |
    ForEach-Object {
      $first = $_.Group[0]
      [pscustomobject]@{
        path = $_.Name
        bucket = $first.bucket
        hitCount = $_.Count
        bytes = $first.bytes
        markerTypes = (($_.Group | Group-Object markerType | Sort-Object Count -Descending | ForEach-Object { "$($_.Name):$($_.Count)" }) -join ", ")
      }
    } |
    Sort-Object @{ Expression = "hitCount"; Descending = $true }, path
)

$bucketSummary = @(
  $hits |
    Group-Object bucket |
    ForEach-Object {
      [pscustomobject]@{
        bucket = $_.Name
        files = @($_.Group | Select-Object -ExpandProperty path -Unique).Count
        hits = $_.Count
        markerTypes = (($_.Group | Group-Object markerType | Sort-Object Count -Descending | ForEach-Object { "$($_.Name):$($_.Count)" }) -join ", ")
      }
    } |
    Sort-Object @{ Expression = "hits"; Descending = $true }, bucket
)

$typeSummary = @(
  $hits |
    Group-Object markerType |
    ForEach-Object {
      [pscustomobject]@{
        markerType = $_.Name
        files = @($_.Group | Select-Object -ExpandProperty path -Unique).Count
        hits = $_.Count
      }
    } |
    Sort-Object @{ Expression = "hits"; Descending = $true }, markerType
)

$topActionCandidates = @(
  $hits |
    Where-Object { $_.markerType -in @("potential_action_item", "known_issue", "next_step", "future_note") } |
    Group-Object path |
    ForEach-Object {
      $first = $_.Group[0]
      [pscustomobject]@{
        path = $_.Name
        bucket = $first.bucket
        actionableHits = $_.Count
        bytes = $first.bytes
        sample = (($_.Group | Select-Object -First 3 | ForEach-Object { "L$($_.line): $($_.text)" }) -join " || ")
      }
    } |
    Sort-Object @{ Expression = "actionableHits"; Descending = $true }, path
)

$jsonPath = Join-Path -Path $OutDir -ChildPath "step540_todo_marker_triage_scan.json"
$summaryPath = Join-Path -Path $OutDir -ChildPath "step540_todo_marker_triage_summary.txt"
$bucketsPath = Join-Path -Path $OutDir -ChildPath "step540_todo_marker_buckets.txt"
$filesPath = Join-Path -Path $OutDir -ChildPath "step540_todo_marker_file_summary.txt"
$actionsPath = Join-Path -Path $OutDir -ChildPath "step540_todo_marker_action_candidates.txt"
$rawPath = Join-Path -Path $OutDir -ChildPath "step540_todo_marker_hits_raw.txt"

[pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    projectRoot = $ProjectRoot
    scannedFiles = @($files).Count
    hitFiles = @($fileSummary).Count
    hits = @($hits).Count
    buckets = @($bucketSummary).Count
    actionCandidateFiles = @($topActionCandidates).Count
  }
  bucketSummary = $bucketSummary
  markerTypeSummary = $typeSummary
  fileSummary = $fileSummary
  actionCandidates = $topActionCandidates
  rawHits = $hits
} | ConvertTo-Json -Depth 30 | Out-File $jsonPath -Encoding utf8

$summaryLines = @()
$summaryLines += "STEP540 TODO/Marker Triage Scan"
$summaryLines += ("Generated: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
$summaryLines += ("ProjectRoot: " + $ProjectRoot)
$summaryLines += ("Scanned files: " + @($files).Count)
$summaryLines += ("Hit files: " + @($fileSummary).Count)
$summaryLines += ("Total hits: " + @($hits).Count)
$summaryLines += ("Buckets: " + @($bucketSummary).Count)
$summaryLines += ("Action candidate files: " + @($topActionCandidates).Count)
$summaryLines += ""
$summaryLines += "Important:"
$summaryLines += "- This is triage only."
$summaryLines += "- Nothing is deleted or moved."
$summaryLines += "- Many hits are expected to be false/context hits."
$summaryLines += "- Upload all STEP540 reports before deciding next cleanup."
$summaryLines | Out-File $summaryPath -Encoding utf8

$bucketLines = @()
$bucketLines += "STEP540 Bucket Summary"
$bucketLines += ""
foreach ($b in $bucketSummary) {
  $bucketLines += ("BUCKET | " + $b.bucket + " | files=" + $b.files + " | hits=" + $b.hits + " | types=" + $b.markerTypes)
}
$bucketLines | Out-File $bucketsPath -Encoding utf8

$fileLines = @()
$fileLines += "STEP540 File Summary"
$fileLines += ""
foreach ($f in $fileSummary) {
  $fileLines += ("FILE | " + $f.path + " | bucket=" + $f.bucket + " | hits=" + $f.hitCount + " | bytes=" + $f.bytes + " | types=" + $f.markerTypes)
}
$fileLines | Out-File $filesPath -Encoding utf8

$actionLines = @()
$actionLines += "STEP540 Action Candidate Files"
$actionLines += "These files contain marker types that may represent real open work."
$actionLines += ""
foreach ($a in $topActionCandidates) {
  $actionLines += ("FILE | " + $a.path + " | bucket=" + $a.bucket + " | actionableHits=" + $a.actionableHits + " | bytes=" + $a.bytes)
  $actionLines += ("  sample: " + $a.sample)
}
$actionLines | Out-File $actionsPath -Encoding utf8

$rawLines = @()
$rawLines += "STEP540 Raw Marker Hits"
$rawLines += ""
foreach ($h in ($hits | Sort-Object path, line)) {
  $rawLines += ($h.path + ":" + $h.line + " | bucket=" + $h.bucket + " | type=" + $h.markerType + " | " + $h.text)
}
$rawLines | Out-File $rawPath -Encoding utf8

Write-Host ""
Write-Host "STEP540 TODO/Marker Triage Scan fertig."
Write-Host ("JSON: " + $jsonPath)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Buckets: " + $bucketsPath)
Write-Host ("File summary: " + $filesPath)
Write-Host ("Action candidates: " + $actionsPath)
Write-Host ("Raw hits: " + $rawPath)
