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

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$errors = @()
$warnings = @()

$toolDir = Join-Path $ProjectRoot "tools"
$systemInspectionDir = Join-Path $ProjectRoot "tools\system-inspection"

$candidates = @()
if (Test-Path -LiteralPath $toolDir) {
  $candidates += @(Get-ChildItem -LiteralPath $toolDir -Recurse -File -Include "*.ps1","*.cmd","*.bat" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Name -match "scan|systemscan|system-scan|inspection|inspect" -and
      $_.FullName -notmatch "step[0-9]+"
    } |
    Sort-Object FullName)
}

$recentStepScanScripts = @()
if (Test-Path -LiteralPath $systemInspectionDir) {
  $recentStepScanScripts = @(Get-ChildItem -LiteralPath $systemInspectionDir -File -Filter "*.ps1" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match "scan|verification|triage" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 25)
}

$repoStatus = ""
try {
  Push-Location $ProjectRoot
  $repoStatus = (git status --short 2>$null) -join "`n"
  Pop-Location
} catch {
  try { Pop-Location } catch {}
  $warnings += "Could not run git status: " + $_.Exception.Message
}

$recommendedAction = ""
if (@($candidates).Count -eq 1) {
  $recommendedAction = "One scan candidate found. Review before running: " + $candidates[0].FullName
} elseif (@($candidates).Count -gt 1) {
  $recommendedAction = "Multiple scan candidates found. Pick the known canonical SystemScan script before running."
} else {
  $recommendedAction = "No canonical fresh SystemScan script found automatically. Use the known project SystemScan workflow or provide the current scan script."
  $warnings += "No canonical fresh SystemScan script found automatically."
}

$summaryPath = Join-Path $OutDir "step614_fresh_systemscan_prep_summary.txt"
$candidatesTsv = Join-Path $OutDir "step614_fresh_systemscan_candidates.tsv"
$recentTsv = Join-Path $OutDir "step614_recent_system_inspection_scripts.tsv"
$jsonPath = Join-Path $OutDir "step614_fresh_systemscan_prep.json"

$candidates | Select-Object Name, FullName, LastWriteTime | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $candidatesTsv -Encoding UTF8
$recentStepScanScripts | Select-Object Name, FullName, LastWriteTime | ConvertTo-Csv -NoTypeInformation -Delimiter "`t" | Out-File -FilePath $recentTsv -Encoding UTF8

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    scanCandidates = @($candidates).Count
    recentSystemInspectionScripts = @($recentStepScanScripts).Count
    gitStatusLines = @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count
    recommendedAction = $recommendedAction
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  candidates = @($candidates | Select-Object Name, FullName, LastWriteTime)
  recentSystemInspectionScripts = @($recentStepScanScripts | Select-Object Name, FullName, LastWriteTime)
  gitStatusShort = $repoStatus
  warningsList = $warnings
  errorsList = $errors
}
$result | ConvertTo-Json -Depth 8 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP614 Fresh SystemScan Prep Summary"
$summary += "Generated: " + $timestamp
$summary += "Scan candidates: " + @($candidates).Count
$summary += "Recent system-inspection scripts: " + @($recentStepScanScripts).Count
$summary += "Git status lines: " + @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count
$summary += "Recommended action: " + $recommendedAction
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
$summary += "Scan candidates:"
foreach ($c in $candidates) {
  $summary += "- " + $c.FullName
}
$summary += ""
$summary += "Recent system-inspection scripts:"
foreach ($s in $recentStepScanScripts) {
  $summary += "- " + $s.Name
}
$summary += ""
$summary += "Git status --short:"
if ([string]::IsNullOrWhiteSpace($repoStatus)) {
  $summary += "(clean or unavailable)"
} else {
  $summary += $repoStatus
}
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
Write-Host "STEP614 Fresh SystemScan Prep fertig."
Write-Host ("Scan candidates: " + @($candidates).Count)
Write-Host ("Recent system-inspection scripts: " + @($recentStepScanScripts).Count)
Write-Host ("Git status lines: " + @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count)
Write-Host ("Recommended action: " + $recommendedAction)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("Candidates TSV: " + $candidatesTsv)
Write-Host ("Recent scripts TSV: " + $recentTsv)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Scan candidates: " + @($candidates).Count)
Write-Host ("Recent system-inspection scripts: " + @($recentStepScanScripts).Count)
Write-Host ("Git status lines: " + @($repoStatus -split "`n" | Where-Object { $_.Trim().Length -gt 0 }).Count)
Write-Host ("Recommended action: " + $recommendedAction)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
