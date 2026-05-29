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

$projectStateRoot = Join-Path -Path $ProjectRoot -ChildPath "project-state"
if (-not (Test-Path $projectStateRoot)) {
  throw "project-state nicht gefunden: $projectStateRoot"
}

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

$coreFiles = @(
  "project-state/CURRENT_STATUS.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md",
  "project-state/FILES.md",
  "project-state/CHANGELOG.md",
  "project-state/GENERAL_PROJECT_PROMPT.md"
)

function Classify-ProjectStateFile {
  param([string]$RelPath, [string]$Content)

  $p = $RelPath.ToLowerInvariant()
  $name = [System.IO.Path]::GetFileName($RelPath).ToLowerInvariant()

  if ($p.StartsWith("project-state/archive/")) { return "archive_existing" }
  if ($coreFiles -contains $RelPath) { return "core_active" }

  if ($name -match "^next_steps_step.*append.*\.md$") { return "next_steps_append_fragment" }
  if ($name -match "^current_status_step.*append.*\.md$") { return "current_status_append_fragment" }
  if ($name -match "^step\d+.*\.md$") { return "step_state_fragment" }
  if ($name -match "^.*archive.*move.*list.*\.(csv|md|txt)$") { return "archive_move_list" }
  if ($name -match "^.*append.*\.md$") { return "append_fragment" }
  if ($name -match "^.*handoff.*\.md$") { return "handoff_or_rule" }
  if ($name -match "^.*preserve.*modal.*draft.*\.md$") { return "feature_state_note" }

  if ($Content -match "STEP\d+") { return "step_related_other" }

  return "other_project_state"
}

function Guess-Recommendation {
  param([string]$Bucket, [string]$RelPath)

  switch ($Bucket) {
    "core_active" { return "KEEP_ACTIVE" }
    "archive_existing" { return "IGNORE_ARCHIVE" }
    "next_steps_append_fragment" { return "TRIAGE_ARCHIVE_AFTER_RESCUE" }
    "current_status_append_fragment" { return "TRIAGE_ARCHIVE_AFTER_RESCUE" }
    "step_state_fragment" { return "TRIAGE_ARCHIVE_AFTER_RESCUE" }
    "append_fragment" { return "TRIAGE_ARCHIVE_AFTER_RESCUE" }
    "archive_move_list" { return "TRIAGE_KEEP_OR_ARCHIVE_REPORT" }
    "handoff_or_rule" { return "REVIEW_MANUAL" }
    "feature_state_note" { return "REVIEW_MANUAL" }
    "step_related_other" { return "REVIEW_MANUAL" }
    default { return "REVIEW_MANUAL" }
  }
}

$files = Get-ChildItem -Path $projectStateRoot -Recurse -File |
  Where-Object { $_.Extension.ToLowerInvariant() -in @(".md", ".txt", ".csv", ".json") }

$items = @()
foreach ($file in $files) {
  $rel = Get-Rel -BasePath $ProjectRoot -FullPath $file.FullName
  $content = Read-TextSafe -Path $file.FullName
  $bucket = Classify-ProjectStateFile -RelPath $rel -Content $content

  $todoHits = 0
  if (-not [string]::IsNullOrEmpty($content)) {
    $todoHits = ([regex]::Matches($content.ToLowerInvariant(), "todo|to-do|offen|next_steps|next step|nächster schritt|naechster schritt|fixme|pending")).Count
  }

  $items += [pscustomobject]@{
    path = $rel
    name = $file.Name
    bucket = $bucket
    recommendation = Guess-Recommendation -Bucket $bucket -RelPath $rel
    bytes = $file.Length
    modified = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    todoMarkerHits = $todoHits
  }
}

$activeItems = @($items | Where-Object { $_.bucket -ne "archive_existing" })
$bucketSummary = @(
  $items |
    Group-Object bucket |
    ForEach-Object {
      [pscustomobject]@{
        bucket = $_.Name
        files = $_.Count
        bytes = ($_.Group | Measure-Object -Property bytes -Sum).Sum
        todoMarkerHits = ($_.Group | Measure-Object -Property todoMarkerHits -Sum).Sum
        recommendations = (($_.Group | Group-Object recommendation | Sort-Object Count -Descending | ForEach-Object { "$($_.Name):$($_.Count)" }) -join ", ")
      }
    } |
    Sort-Object @{ Expression = "files"; Descending = $true }, bucket
)

$recommendationSummary = @(
  $items |
    Group-Object recommendation |
    ForEach-Object {
      [pscustomobject]@{
        recommendation = $_.Name
        files = $_.Count
        bytes = ($_.Group | Measure-Object -Property bytes -Sum).Sum
      }
    } |
    Sort-Object @{ Expression = "files"; Descending = $true }, recommendation
)

$coreReport = @($items | Where-Object { $_.bucket -eq "core_active" } | Sort-Object path)
$candidates = @($items | Where-Object { $_.recommendation -in @("TRIAGE_ARCHIVE_AFTER_RESCUE", "TRIAGE_KEEP_OR_ARCHIVE_REPORT") } | Sort-Object bucket, path)
$manual = @($items | Where-Object { $_.recommendation -eq "REVIEW_MANUAL" -and $_.bucket -ne "archive_existing" } | Sort-Object bucket, path)

$jsonPath = Join-Path -Path $OutDir -ChildPath "step542_project_state_triage_scan.json"
$summaryPath = Join-Path -Path $OutDir -ChildPath "step542_project_state_triage_summary.txt"
$bucketsPath = Join-Path -Path $OutDir -ChildPath "step542_project_state_buckets.txt"
$corePath = Join-Path -Path $OutDir -ChildPath "step542_project_state_core_active.txt"
$candidatesPath = Join-Path -Path $OutDir -ChildPath "step542_project_state_archive_candidates.txt"
$manualPath = Join-Path -Path $OutDir -ChildPath "step542_project_state_manual_review.txt"

[pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    projectRoot = $ProjectRoot
    projectStateFiles = @($items).Count
    activeFilesOutsideArchive = @($activeItems).Count
    buckets = @($bucketSummary).Count
    coreActiveFiles = @($coreReport).Count
    archiveCandidateFiles = @($candidates).Count
    manualReviewFiles = @($manual).Count
  }
  bucketSummary = $bucketSummary
  recommendationSummary = $recommendationSummary
  coreActive = $coreReport
  archiveCandidates = $candidates
  manualReview = $manual
  allItems = $items
} | ConvertTo-Json -Depth 30 | Out-File $jsonPath -Encoding utf8

$summaryLines = @()
$summaryLines += "STEP542 Project-State Triage Scan"
$summaryLines += ("Generated: " + (Get-Date).ToString("yyyy-MM-dd HH:mm:ss"))
$summaryLines += ("ProjectRoot: " + $ProjectRoot)
$summaryLines += ("Project-state files: " + @($items).Count)
$summaryLines += ("Active files outside archive: " + @($activeItems).Count)
$summaryLines += ("Buckets: " + @($bucketSummary).Count)
$summaryLines += ("Core active files: " + @($coreReport).Count)
$summaryLines += ("Archive candidate files: " + @($candidates).Count)
$summaryLines += ("Manual review files: " + @($manual).Count)
$summaryLines += ""
$summaryLines += "Important:"
$summaryLines += "- This is scan/triage only."
$summaryLines += "- Nothing is deleted or moved."
$summaryLines += "- Do not archive anything before content rescue/consolidation."
$summaryLines += "- Upload all STEP542 reports before deciding the next batch."
$summaryLines | Out-File $summaryPath -Encoding utf8

$bucketLines = @()
$bucketLines += "STEP542 Project-State Bucket Summary"
$bucketLines += ""
foreach ($b in $bucketSummary) {
  $bucketLines += ("BUCKET | " + $b.bucket + " | files=" + $b.files + " | bytes=" + $b.bytes + " | todoMarkerHits=" + $b.todoMarkerHits + " | recommendations=" + $b.recommendations)
}
$bucketLines | Out-File $bucketsPath -Encoding utf8

$coreLines = @()
$coreLines += "STEP542 Core Active Project-State Files"
$coreLines += ""
foreach ($i in $coreReport) {
  $coreLines += ("KEEP | " + $i.path + " | bytes=" + $i.bytes + " | modified=" + $i.modified + " | todoMarkerHits=" + $i.todoMarkerHits)
}
$coreLines | Out-File $corePath -Encoding utf8

$candidateLines = @()
$candidateLines += "STEP542 Project-State Archive/Triage Candidates"
$candidateLines += "These are NOT to be moved automatically. Rescue/consolidate first."
$candidateLines += ""
foreach ($i in $candidates) {
  $candidateLines += ("CANDIDATE | " + $i.path + " | bucket=" + $i.bucket + " | recommendation=" + $i.recommendation + " | bytes=" + $i.bytes + " | todoMarkerHits=" + $i.todoMarkerHits)
}
$candidateLines | Out-File $candidatesPath -Encoding utf8

$manualLines = @()
$manualLines += "STEP542 Project-State Manual Review"
$manualLines += ""
foreach ($i in $manual) {
  $manualLines += ("REVIEW | " + $i.path + " | bucket=" + $i.bucket + " | bytes=" + $i.bytes + " | todoMarkerHits=" + $i.todoMarkerHits)
}
$manualLines | Out-File $manualPath -Encoding utf8

Write-Host ""
Write-Host "STEP542 Project-State Triage Scan fertig."
Write-Host ("JSON: " + $jsonPath)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Buckets: " + $bucketsPath)
Write-Host ("Core active: " + $corePath)
Write-Host ("Archive candidates: " + $candidatesPath)
Write-Host ("Manual review: " + $manualPath)
