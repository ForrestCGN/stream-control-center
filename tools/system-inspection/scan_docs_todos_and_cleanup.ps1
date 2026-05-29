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

function Get-CleanupReasonsText {
  param(
    [string]$RelativePath,
    [string]$Content
  )

  $reasons = @()
  $p = $RelativePath.Replace("\", "/").ToLowerInvariant()
  $c = $Content.ToLowerInvariant()

  if ($p -match "append") { $reasons += "APPEND_FRAGMENT" }
  if ($p -match "step[0-9]+") { $reasons += "STEP_FRAGMENT" }
  if ($p -match "readme_step") { $reasons += "README_STEP_FRAGMENT" }
  if ($p -match "handoff" -and $p -ne "docs/handoff/next_chat_handoff.md") { $reasons += "OLD_HANDOFF" }
  if ($p -match "test|debug|diagnostic|legacy|old|obsolete|tmp|temp|wip") { $reasons += "TEST_DEBUG_LEGACY_NAME" }
  if ($c -match "zurueckgezogen|zurückgezogen|nicht benutzen|not use|deprecated|obsolete|remove later|cleanup") { $reasons += "CONTENT_CLEANUP_MARKER" }

  $unique = @()
  foreach ($r in $reasons) {
    if ($unique -notcontains $r) {
      $unique += $r
    }
  }

  return ($unique -join ", ")
}

function Count-TodoHits {
  param([string]$Content)

  $count = 0
  $lines = $Content -split "`n"
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
    "pending"
  )

  foreach ($line in $lines) {
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

Write-Host "Scanne Doku/TODOs: $ProjectRoot"
Write-Host "Ausgabe: $OutDir"

$docFiles = @()
$roots = @("docs", "project-state")

foreach ($rootName in $roots) {
  $rootPath = Join-Path $ProjectRoot $rootName
  if (-not (Test-Path $rootPath)) { continue }

  $found = Get-ChildItem -Path $rootPath -Recurse -File |
    Where-Object {
      $_.Extension.ToLowerInvariant() -in @(".md", ".txt", ".csv")
    }

  foreach ($f in $found) {
    $docFiles += $f
  }
}

$docFiles = $docFiles | Sort-Object FullName

$inventory = @()
$candidateLines = @()
$todoLines = @()
$todoHitsTotal = 0
$candidateCount = 0

$todoLines += "STEP531 TODO / FIXME / OFFEN Hits"
$todoLines += "Diese Zeilen vor Doku-Cleanup pruefen und in aktuelle TODO/NEXT_STEPS/CURRENT_STATUS uebernehmen."
$todoLines += ""

$candidateLines += "STEP531 Docs Cleanup Candidates"
$candidateLines += "Nur Kandidaten. Nicht automatisch loeschen."
$candidateLines += ""

foreach ($file in $docFiles) {
  $rel = Get-RelativePathSafe -BasePath $ProjectRoot -FullPath $file.FullName
  $relNorm = $rel.Replace("\", "/")
  $content = Read-TextSafe -Path $file.FullName
  $reasonsText = Get-CleanupReasonsText -RelativePath $rel -Content $content
  $todoCount = Count-TodoHits -Content $content
  $todoHitsTotal += $todoCount

  $inventory += [pscustomobject]@{
    path = $relNorm
    bytes = $file.Length
    modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    cleanupReasons = $reasonsText
    todoHits = $todoCount
  }

  if (-not [string]::IsNullOrWhiteSpace($reasonsText)) {
    $candidateCount++
    $candidateLines += ($relNorm + " | reasons=" + $reasonsText + " | todoHits=" + $todoCount)
  }

  if ($todoCount -gt 0) {
    $lines = $content -split "`n"
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
      "pending"
    )

    for ($i = 0; $i -lt $lines.Count; $i++) {
      $lineText = $lines[$i].Trim()
      if ([string]::IsNullOrWhiteSpace($lineText)) { continue }

      $lower = $lineText.ToLowerInvariant()
      $hit = $false

      foreach ($marker in $markers) {
        if ($lower.Contains($marker)) {
          $hit = $true
          break
        }
      }

      if ($hit) {
        if ($lineText.Length -gt 260) {
          $lineText = $lineText.Substring(0, 260) + " ..."
        }

        $todoLines += ($relNorm + ":" + ($i + 1) + " | " + $lineText)
      }
    }
  }
}

$summary = [pscustomobject]@{
  generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  projectRoot = $ProjectRoot
  docsScanned = @($docFiles).Count
  cleanupCandidates = $candidateCount
  todoHits = $todoHitsTotal
}

$result = [pscustomobject]@{
  summary = $summary
  inventory = $inventory
}

$jsonPath = Join-Path $OutDir "step531_docs_todo_cleanup_scan.json"
$summaryPath = Join-Path $OutDir "step531_docs_summary.txt"
$candidatesPath = Join-Path $OutDir "step531_docs_cleanup_candidates.txt"
$todosPath = Join-Path $OutDir "step531_docs_todo_hits.txt"

$result | ConvertTo-Json -Depth 20 | Out-File $jsonPath -Encoding utf8

$summaryLines = @()
$summaryLines += "STEP531 Docs/TODO Cleanup Scan"
$summaryLines += ("Generated: " + $summary.generatedAt)
$summaryLines += ("ProjectRoot: " + $summary.projectRoot)
$summaryLines += ("Docs scanned: " + $summary.docsScanned)
$summaryLines += ("Cleanup candidates: " + $summary.cleanupCandidates)
$summaryLines += ("TODO hits: " + $summary.todoHits)
$summaryLines += ""
$summaryLines += "Regel:"
$summaryLines += "- Nichts automatisch loeschen."
$summaryLines += "- TODOs zuerst retten/konsolidieren."
$summaryLines += "- Append-/STEP-Dokus erst nach Inhaltspruefung verschieben."
$summaryLines | Out-File $summaryPath -Encoding utf8

$candidateLines | Out-File $candidatesPath -Encoding utf8
$todoLines | Out-File $todosPath -Encoding utf8

Write-Host ""
Write-Host "STEP531 Scan fertig."
Write-Host ("JSON: " + $jsonPath)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Candidates: " + $candidatesPath)
Write-Host ("TODOs: " + $todosPath)
