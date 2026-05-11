# STEP233 - Archive old project documentation fragments
# Run from repo root: D:\Git\stream-control-center
# Moves known old append/status/handoff fragments into archive folders.
# Does not delete content; existing destination files are left untouched.

$ErrorActionPreference = "Stop"
$Root = (Get-Location).Path
$ArchiveBase = "project-state\archive\2026-05-11-step233"
$DocsArchiveBase = "docs\archive\2026-05-11-step233"
$ManifestPath = Join-Path $Root "docs\archive\2026-05-11\STEP233_ARCHIVE_MANIFEST_2026-05-11.txt"

if (-not (Test-Path -LiteralPath $ManifestPath)) {
  throw "Manifest not found: $ManifestPath"
}

$Files = Get-Content -LiteralPath $ManifestPath -Encoding UTF8 |
  ForEach-Object { $_.Trim() } |
  Where-Object { $_ -and -not $_.StartsWith('#') }

$moved = 0
$missing = 0
$skipped = 0

foreach ($relRaw in $Files) {
  $rel = $relRaw.Replace('/', '\')
  $src = Join-Path $Root $rel

  if (-not (Test-Path -LiteralPath $src)) {
    Write-Host "MISSING: $rel"
    $missing++
    continue
  }

  if ($rel.StartsWith("docs\")) {
    $clean = $rel -replace "^docs\\", ""
    $destRel = Join-Path $DocsArchiveBase $clean
  } elseif ($rel.StartsWith("project-state\")) {
    $clean = $rel -replace "^project-state\\", ""
    $destRel = Join-Path $ArchiveBase $clean
  } else {
    Write-Host "SKIP outside expected docs/project-state path: $rel"
    $skipped++
    continue
  }

  $dest = Join-Path $Root $destRel
  $destDir = Split-Path -Parent $dest
  New-Item -ItemType Directory -Path $destDir -Force | Out-Null

  if (Test-Path -LiteralPath $dest) {
    Write-Host "SKIP exists: $destRel"
    $skipped++
    continue
  }

  Move-Item -LiteralPath $src -Destination $dest
  Write-Host "MOVED: $rel -> $destRel"
  $moved++
}

Write-Host "STEP233 archive complete. moved=$moved missing=$missing skipped=$skipped"
Write-Host "Review with: git status --short"
