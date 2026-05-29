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
    if ($bytes.Length -gt 1000000) { return "" }
    return [System.Text.Encoding]::UTF8.GetString($bytes)
  } catch {
    return ""
  }
}

function Count-Markers {
  param([string]$Content)
  $markers = @(
    "todo", "fixme", "offen", "known issue", "known_issues",
    "next step", "next_steps", "später", "spaeter", "follow-up",
    "muss noch", "pending", "bewusst offen"
  )
  $count = 0
  foreach ($line in ($Content -split "`n")) {
    $lower = $line.ToLowerInvariant()
    foreach ($m in $markers) {
      if ($lower.Contains($m)) {
        $count++
        break
      }
    }
  }
  return $count
}

$docsRoot = Join-Path $ProjectRoot "docs"
$projectStateRoot = Join-Path $ProjectRoot "project-state"

$docsFiles = @()
if (Test-Path $docsRoot) {
  $docsFiles = Get-ChildItem -Path $docsRoot -Recurse -File |
    Where-Object { $_.Extension.ToLowerInvariant() -in @(".md", ".txt", ".csv") }
}

$projectStateFiles = @()
if (Test-Path $projectStateRoot) {
  $projectStateFiles = Get-ChildItem -Path $projectStateRoot -Recurse -File |
    Where-Object { $_.Extension.ToLowerInvariant() -in @(".md", ".txt", ".csv") }
}

$technicalStepPatterns = @(
  "^docs/current/CURRENT_SYSTEM_STATUS_STEP.*APPEND",
  "^docs/current/STEP[0-9]",
  "^docs/backend/.*STEP[0-9]",
  "^docs/dashboard/.*STEP[0-9]",
  "^docs/vip/STEP[0-9]",
  "^docs/overlays/STEP[0-9]",
  "^docs/media/.*STEP[0-9]",
  "^docs/README_STEP[0-9]",
  "^docs/STEP[0-9]"
)

$remainingTechnical = @()
foreach ($file in $docsFiles) {
  $rel = Get-Rel -BasePath $ProjectRoot -FullPath $file.FullName
  $p = $rel.ToLowerInvariant()

  if ($p.StartsWith("docs/archive/")) { continue }
  if ($p.StartsWith("docs/_generated/")) { continue }

  $matches = $false
  foreach ($pattern in $technicalStepPatterns) {
    if ($rel -match $pattern) {
      $matches = $true
      break
    }
  }

  if ($matches) {
    $remainingTechnical += [pscustomobject]@{
      path = $rel
      bytes = $file.Length
      modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
  }
}

$consolidatedDocs = @()
foreach ($file in $docsFiles) {
  $rel = Get-Rel -BasePath $ProjectRoot -FullPath $file.FullName
  if ($rel -match "CONSOLIDATED|CURRENT_STEP_HISTORY") {
    $consolidatedDocs += [pscustomobject]@{
      path = $rel
      bytes = $file.Length
      modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
  }
}

$todoHits = @()
foreach ($file in ($docsFiles + $projectStateFiles)) {
  $rel = Get-Rel -BasePath $ProjectRoot -FullPath $file.FullName
  $p = $rel.ToLowerInvariant()

  if ($p.StartsWith("docs/archive/")) { continue }
  if ($p.StartsWith("docs/_generated/")) { continue }
  if ($p.StartsWith("project-state/archive/")) { continue }

  $content = Read-TextSafe -Path $file.FullName
  $count = Count-Markers -Content $content
  if ($count -gt 0) {
    $todoHits += [pscustomobject]@{
      path = $rel
      todoHits = $count
      bytes = $file.Length
    }
  }
}

$summary = [pscustomobject]@{
  generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  projectRoot = $ProjectRoot
  docsFiles = @($docsFiles).Count
  projectStateFiles = @($projectStateFiles).Count
  remainingTechnicalStepDocs = @($remainingTechnical).Count
  consolidatedDocs = @($consolidatedDocs).Count
  todoHitFiles = @($todoHits).Count
  todoHits = (($todoHits | Measure-Object -Property todoHits -Sum).Sum)
}

$jsonPath = Join-Path $OutDir "step537_post_cleanup_docs_verification.json"
$summaryPath = Join-Path $OutDir "step537_post_cleanup_docs_verification_summary.txt"
$remainingPath = Join-Path $OutDir "step537_remaining_technical_step_docs.txt"
$consolidatedPath = Join-Path $OutDir "step537_consolidated_docs.txt"
$todoPath = Join-Path $OutDir "step537_remaining_todo_hits.txt"

[pscustomobject]@{
  summary = $summary
  remainingTechnicalStepDocs = $remainingTechnical | Sort-Object path
  consolidatedDocs = $consolidatedDocs | Sort-Object path
  todoHits = $todoHits | Sort-Object @{ Expression = "todoHits"; Descending = $true }, path
} | ConvertTo-Json -Depth 20 | Out-File $jsonPath -Encoding utf8

$summaryLines = @()
$summaryLines += "STEP537 Post-Cleanup Docs Verification"
$summaryLines += ("Generated: " + $summary.generatedAt)
$summaryLines += ("ProjectRoot: " + $summary.projectRoot)
$summaryLines += ("Docs files: " + $summary.docsFiles)
$summaryLines += ("Project-state files: " + $summary.projectStateFiles)
$summaryLines += ("Remaining technical STEP docs outside archive/generated: " + $summary.remainingTechnicalStepDocs)
$summaryLines += ("Consolidated docs: " + $summary.consolidatedDocs)
$summaryLines += ("TODO-hit files: " + $summary.todoHitFiles)
$summaryLines += ("TODO hits: " + $summary.todoHits)
$summaryLines += ""
$summaryLines += "Rule:"
$summaryLines += "- This is verification only."
$summaryLines += "- Nothing is deleted or moved."
$summaryLines += "- Upload all generated reports before deciding the next cleanup batch."
$summaryLines | Out-File $summaryPath -Encoding utf8

$remainingLines = @()
$remainingLines += "STEP537 Remaining Technical STEP Docs"
$remainingLines += "Outside docs/archive and docs/_generated."
$remainingLines += ""
foreach ($item in ($remainingTechnical | Sort-Object path)) {
  $remainingLines += ($item.path + " | bytes=" + $item.bytes + " | modified=" + $item.modified)
}
$remainingLines | Out-File $remainingPath -Encoding utf8

$consolidatedLines = @()
$consolidatedLines += "STEP537 Consolidated Docs"
$consolidatedLines += ""
foreach ($item in ($consolidatedDocs | Sort-Object path)) {
  $consolidatedLines += ($item.path + " | bytes=" + $item.bytes + " | modified=" + $item.modified)
}
$consolidatedLines | Out-File $consolidatedPath -Encoding utf8

$todoLines = @()
$todoLines += "STEP537 Remaining TODO/Marker Hits"
$todoLines += "Outside docs/archive, docs/_generated and project-state/archive."
$todoLines += ""
foreach ($item in ($todoHits | Sort-Object @{ Expression = "todoHits"; Descending = $true }, path)) {
  $todoLines += ($item.path + " | todoHits=" + $item.todoHits + " | bytes=" + $item.bytes)
}
$todoLines | Out-File $todoPath -Encoding utf8

Write-Host ""
Write-Host "STEP537 Verification Scan fertig."
Write-Host ("JSON: " + $jsonPath)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Remaining technical STEP docs: " + $remainingPath)
Write-Host ("Consolidated docs: " + $consolidatedPath)
Write-Host ("Remaining TODO hits: " + $todoPath)
