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

$projectStateDir = Join-Path -Path $ProjectRoot -ChildPath "project-state"
$historyRel = "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
$historyPath = Join-Path -Path $ProjectRoot -ChildPath ($historyRel.Replace("/", "\"))
$finalMarker = "<!-- STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION -->"

$activeProjectState = @(
  "project-state/CHANGELOG.md",
  "project-state/CHANNELPOINTS_CURRENT_STATE.md",
  "project-state/COMMANDS_CURRENT_STATE.md",
  "project-state/CURRENT_STATUS.md",
  "project-state/FILES.md",
  "project-state/GENERAL_PROJECT_PROMPT.md",
  "project-state/NEXT_STEPS.md",
  "project-state/TODO.md",
  "project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md",
  "project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md",
  "project-state/STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION.md"
)

$activeDocs = @(
  "docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md",
  "docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md",
  "docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md",
  "docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md",
  "docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md",
  "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md",
  "docs/system-inspection/STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION.md"
)

$archives = @(
  [pscustomobject]@{
    key = "batch_b_module_meta_rules"
    rel = "project-state/archive/2026-05-29-step558-module-meta-rules"
    expected = 7
  },
  [pscustomobject]@{
    key = "communication_bus"
    rel = "project-state/archive/2026-05-30-step563-communication-bus-contract"
    expected = 2
  },
  [pscustomobject]@{
    key = "shoutout"
    rel = "project-state/archive/2026-05-30-step568-shoutout-state"
    expected = 4
  },
  [pscustomobject]@{
    key = "channelpoints_build"
    rel = "project-state/archive/2026-05-30-step573-channelpoints-build-state"
    expected = 7
  },
  [pscustomobject]@{
    key = "dashboard_commands"
    rel = "project-state/archive/2026-05-30-step578-dashboard-commands-state"
    expected = 3
  },
  [pscustomobject]@{
    key = "current_run_docs"
    rel = "project-state/archive/2026-05-30-step583-current-run-docs"
    expected = 46
  }
)

$allowedRootStepDocs = @(
  "project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md",
  "project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md",
  "project-state/STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION.md"
)

function To-Full {
  param([string]$Rel)
  return Join-Path -Path $ProjectRoot -ChildPath ($Rel.Replace("/", "\"))
}

function To-Rel {
  param([string]$FullPath)
  $full = [System.IO.Path]::GetFullPath($FullPath)
  $rootFull = [System.IO.Path]::GetFullPath($ProjectRoot)
  return $full.Substring($rootFull.Length).TrimStart("\").Replace("\", "/")
}

function Get-Info {
  param([string]$Rel)
  $full = To-Full -Rel $Rel
  $exists = Test-Path -LiteralPath $full
  $bytes = 0
  $modified = ""
  if ($exists) {
    $item = Get-Item -LiteralPath $full
    $bytes = $item.Length
    $modified = $item.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
  }
  return [pscustomobject]@{
    path = $Rel
    exists = $exists
    bytes = $bytes
    modified = $modified
  }
}

$errors = @()
$warnings = @()

$activeProjectStateStatus = @()
foreach ($rel in $activeProjectState) {
  $info = Get-Info -Rel $rel
  $activeProjectStateStatus += $info
  if (-not $info.exists) {
    $errors += ("Missing active project-state file: " + $rel)
  }
}

$activeDocsStatus = @()
foreach ($rel in $activeDocs) {
  $info = Get-Info -Rel $rel
  $activeDocsStatus += $info
  if (-not $info.exists) {
    $errors += ("Missing active docs file: " + $rel)
  }
}

$rootFiles = @()
if (Test-Path -LiteralPath $projectStateDir) {
  $rootMd = @(Get-ChildItem -LiteralPath $projectStateDir -File -Filter "*.md" | Sort-Object Name)
  foreach ($f in $rootMd) {
    $rootFiles += [pscustomobject]@{
      path = To-Rel -FullPath $f.FullName
      bytes = $f.Length
      modified = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
    }
  }
} else {
  $errors += "project-state directory missing"
}

$unexpectedRootStepDocs = @($rootFiles | Where-Object {
  ($_.path -like "project-state/STEP*.md" -or $_.path -like "project-state/NEXT_STEPS_STEP*_APPEND.md") -and
  ($allowedRootStepDocs -notcontains $_.path)
})

foreach ($f in $unexpectedRootStepDocs) {
  $errors += ("Unexpected STEP/NEXT_STEPS_STEP root file: " + $f.path)
}

$archiveStatus = @()
foreach ($a in $archives) {
  $full = To-Full -Rel $a.rel
  $exists = Test-Path -LiteralPath $full
  $count = 0
  if ($exists) {
    $count = @((Get-ChildItem -LiteralPath $full -File -Filter "*.md")).Count
  }
  $ok = ($exists -and $count -eq $a.expected)
  if (-not $exists) {
    $errors += ("Missing archive directory: " + $a.rel)
  } elseif ($count -ne $a.expected) {
    $errors += ("Archive count mismatch: " + $a.rel + " expected=" + $a.expected + " actual=" + $count)
  }
  $archiveStatus += [pscustomobject]@{
    key = $a.key
    path = $a.rel
    exists = $exists
    expected = $a.expected
    actual = $count
    ok = $ok
  }
}

$historyChanged = $false
$historyAlreadyPresent = $false

if (Test-Path -LiteralPath $historyPath) {
  $historyContent = Get-Content -LiteralPath $historyPath -Raw -Encoding UTF8
  $historyAlreadyPresent = $historyContent.Contains($finalMarker)
  if (-not $historyAlreadyPresent) {
    $timestampForHistory = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $append = @"

$finalMarker

## STEP588 - Final Project-State Cleanup Verification

Stand: 2026-05-30  
Append erzeugt: $timestampForHistory

### Finaler Ergebnisstand

Der Project-State-Cleanup-Lauf STEP553-STEP588 ist abgeschlossen.

Aktiver Root-Stand:

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/STEP586_CURRENT_RUN_DOCS_ARCHIVE_APPLY.md
project-state/STEP587_POST_CURRENT_RUN_DOCS_VERIFICATION_SCAN.md
project-state/STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION.md
```

Aktive fachliche Konsolidierungsdateien:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

Archivierte Bereiche:

```text
project-state/archive/2026-05-29-step558-module-meta-rules/                 7 Dateien
project-state/archive/2026-05-30-step563-communication-bus-contract/        2 Dateien
project-state/archive/2026-05-30-step568-shoutout-state/                    4 Dateien
project-state/archive/2026-05-30-step573-channelpoints-build-state/         7 Dateien
project-state/archive/2026-05-30-step578-dashboard-commands-state/          3 Dateien
project-state/archive/2026-05-30-step583-current-run-docs/                 46 Dateien
```

Verification-Ziel:

```text
Unexpected STEP/NEXT_STEPS_STEP root files: 0
Archive count mismatches: 0
Warnings: 0
Errors: 0
```

### Wichtige Schutzregel

Dieser Cleanup hat keine produktive Funktionalitaet entfernt. Es wurden Dokumentations- und Projektstandsdateien konsolidiert und archiviert.

Produktive Bereiche bleiben unangetastet:

```text
backend/**
htdocs/**
config/**
data/**
.env
secrets/**
```

<!-- /STEP588_FINAL_PROJECT_STATE_CLEANUP_VERIFICATION -->
"@
    Add-Content -LiteralPath $historyPath -Value $append -Encoding UTF8
    $historyChanged = $true
  }
} else {
  $errors += ("History file missing: " + $historyRel)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

$summaryPath = Join-Path -Path $OutDir -ChildPath "step588_final_project_state_cleanup_summary.txt"
$rootPath = Join-Path -Path $OutDir -ChildPath "step588_project_state_root_files.txt"
$archivePath = Join-Path -Path $OutDir -ChildPath "step588_archive_summary.txt"
$jsonPath = Join-Path -Path $OutDir -ChildPath "step588_final_project_state_cleanup_verification.json"

$result = [pscustomobject]@{
  summary = [pscustomobject]@{
    generatedAt = $timestamp
    projectRoot = $ProjectRoot
    rootMdFiles = @($rootFiles).Count
    activeProjectStateChecked = @($activeProjectStateStatus).Count
    activeDocsChecked = @($activeDocsStatus).Count
    allowedRootStepDocs = @($allowedRootStepDocs).Count
    unexpectedStepRootFiles = @($unexpectedRootStepDocs).Count
    archiveGroupsChecked = @($archiveStatus).Count
    archiveGroupsOk = @($archiveStatus | Where-Object { $_.ok }).Count
    historyAlreadyPresent = $historyAlreadyPresent
    historyChanged = $historyChanged
    warnings = @($warnings).Count
    errors = @($errors).Count
  }
  activeProjectState = $activeProjectStateStatus
  activeDocs = $activeDocsStatus
  allowedRootStepDocs = $allowedRootStepDocs
  rootFiles = $rootFiles
  unexpectedStepRootFiles = $unexpectedRootStepDocs
  archives = $archiveStatus
  warningsList = $warnings
  errorsList = $errors
}

$result | ConvertTo-Json -Depth 10 | Out-File -FilePath $jsonPath -Encoding UTF8

$summary = @()
$summary += "STEP588 Final Project-State Cleanup Verification Summary"
$summary += "Generated: " + $timestamp
$summary += "ProjectRoot: " + $ProjectRoot
$summary += "Root md files: " + @($rootFiles).Count
$summary += "Active project-state checked: " + @($activeProjectStateStatus).Count
$summary += "Active docs checked: " + @($activeDocsStatus).Count
$summary += "Allowed root STEP docs: " + @($allowedRootStepDocs).Count
$summary += "Unexpected STEP/NEXT_STEPS_STEP root files: " + @($unexpectedRootStepDocs).Count
$summary += "Archive groups checked: " + @($archiveStatus).Count
$summary += "Archive groups OK: " + @($archiveStatus | Where-Object { $_.ok }).Count
$summary += "History already present: " + $historyAlreadyPresent
$summary += "History changed: " + $historyChanged
$summary += "Warnings: " + @($warnings).Count
$summary += "Errors: " + @($errors).Count
$summary += ""
if (@($errors).Count -gt 0) {
  $summary += "Errors:"
  foreach ($e in $errors) { $summary += "ERROR | " + $e }
  $summary += ""
}
if (@($warnings).Count -gt 0) {
  $summary += "Warnings:"
  foreach ($w in $warnings) { $summary += "WARN | " + $w }
}
$summary | Out-File -FilePath $summaryPath -Encoding UTF8

$rootLines = @()
$rootLines += "STEP588 Project-State Root Files"
$rootLines += ""
foreach ($f in $rootFiles) {
  $rootLines += $f.path + " | bytes=" + $f.bytes + " | modified=" + $f.modified
}
$rootLines | Out-File -FilePath $rootPath -Encoding UTF8

$archiveLines = @()
$archiveLines += "STEP588 Archive Summary"
$archiveLines += ""
foreach ($a in $archiveStatus) {
  $archiveLines += $a.key + " | " + $a.path + " | exists=" + $a.exists + " | expected=" + $a.expected + " | actual=" + $a.actual + " | ok=" + $a.ok
}
$archiveLines | Out-File -FilePath $archivePath -Encoding UTF8

Write-Host ""
Write-Host "STEP588 Final Project-State Cleanup Verification fertig."
Write-Host ("Root md files: " + @($rootFiles).Count)
Write-Host ("Active project-state checked: " + @($activeProjectStateStatus).Count)
Write-Host ("Active docs checked: " + @($activeDocsStatus).Count)
Write-Host ("Allowed root STEP docs: " + @($allowedRootStepDocs).Count)
Write-Host ("Unexpected STEP/NEXT_STEPS_STEP root files: " + @($unexpectedRootStepDocs).Count)
Write-Host ("Archive groups checked: " + @($archiveStatus).Count)
Write-Host ("Archive groups OK: " + @($archiveStatus | Where-Object { $_.ok }).Count)
Write-Host ("History already present: " + $historyAlreadyPresent)
Write-Host ("History changed: " + $historyChanged)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
Write-Host ("Summary: " + $summaryPath)
Write-Host ("RootFiles: " + $rootPath)
Write-Host ("ArchiveSummary: " + $archivePath)
Write-Host ("JSON: " + $jsonPath)

Write-Host ""
Write-Host "COPY_THIS_RESULT:"
Write-Host ("Root md files: " + @($rootFiles).Count)
Write-Host ("Active project-state checked: " + @($activeProjectStateStatus).Count)
Write-Host ("Active docs checked: " + @($activeDocsStatus).Count)
Write-Host ("Allowed root STEP docs: " + @($allowedRootStepDocs).Count)
Write-Host ("Unexpected STEP/NEXT_STEPS_STEP root files: " + @($unexpectedRootStepDocs).Count)
Write-Host ("Archive groups checked: " + @($archiveStatus).Count)
Write-Host ("Archive groups OK: " + @($archiveStatus | Where-Object { $_.ok }).Count)
Write-Host ("History already present: " + $historyAlreadyPresent)
Write-Host ("History changed: " + $historyChanged)
Write-Host ("Warnings: " + @($warnings).Count)
Write-Host ("Errors: " + @($errors).Count)
