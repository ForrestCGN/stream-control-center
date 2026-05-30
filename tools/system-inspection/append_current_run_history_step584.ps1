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

$historyRel = "docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md"
$historyPath = Join-Path -Path $ProjectRoot -ChildPath ($historyRel.Replace("/", "\"))
$marker = "<!-- STEP584_CURRENT_RUN_DOCS_RESCUE_HISTORY_APPEND -->"

if (-not (Test-Path -LiteralPath $historyPath)) {
  throw ("Run-History nicht gefunden: " + $historyRel)
}

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$existing = Get-Content -LiteralPath $historyPath -Raw -Encoding UTF8

$alreadyPresent = $existing.Contains($marker)
$changed = $false

$append = @"

$marker

## STEP553-STEP583 - Project-State Cleanup Run / Batch B-F Abschluss

Stand: 2026-05-30  
Append erzeugt: $timestamp

### Zweck

Dieser Abschnitt sichert den aktuellen Dokumentations-Cleanup-Lauf, bevor die temporären Run-Dokumente aus `project-state` archiviert werden.

Die fachlichen Inhalte der alten STEP-/Planungsdokumente wurden nicht gelöscht, sondern in aktive Konsolidierungsdateien und Archivordner überführt.

### Aktiver Ergebnisstand

Aktive Kern- und Referenzdateien bleiben:

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

Aktive fachliche Konsolidierungsdateien:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
```

### Abgeschlossene Batches

#### Batch B - Module / Meta Rules

Quelle:

```text
project-state/STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md
project-state/STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md
project-state/STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md
project-state/STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE.md
project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md
project-state/STEP481_SERVER_LOG_MODULE_META_RULES.md
project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md
```

Aktive Konsolidierung:

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
```

Archiv:

```text
project-state/archive/2026-05-29-step558-module-meta-rules/
```

Verification:

```text
Batch B leftovers in root: 0
Batch B archive present: 7
Warnings: 0
Errors: 0
```

#### Batch C - Communication Bus

Quelle:

```text
project-state/STEP487_COMMUNICATION_BUS_MODULE_CONTRACT.md
project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md
```

Aktive Konsolidierung:

```text
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
```

Archiv:

```text
project-state/archive/2026-05-30-step563-communication-bus-contract/
```

Verification:

```text
Communication Bus leftovers in root: 0
Communication archive present: 2
Warnings: 0
Errors: 0
```

#### Batch D - Shoutout

Quelle:

```text
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
project-state/STEP484_SHOUTOUT_INBOUND_EVENTSUB_INTEGRATION.md
project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md
project-state/STEP486_SHOUTOUT_LIVE_TEST_AND_DECISION_PREP.md
```

Aktive Konsolidierung:

```text
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
```

Archiv:

```text
project-state/archive/2026-05-30-step568-shoutout-state/
```

Verification:

```text
Shoutout leftovers in root: 0
Shoutout archive present: 4
Warnings: 0
Errors: 0
```

#### Batch E - Channelpoints Build

Quelle:

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

Aktive Konsolidierung:

```text
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
```

Archiv:

```text
project-state/archive/2026-05-30-step573-channelpoints-build-state/
```

Verification:

```text
Channelpoints build leftovers in root: 0
Channelpoints archive present: 7
Warnings: 0
Errors: 0
```

#### Batch F - Dashboard / Commands

Quelle:

```text
project-state/STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN.md
project-state/STEP496_COMMANDS_DASHBOARD_ALIGNMENT.md
project-state/STEP497_COMMANDS_STATUS_LIGHT.md
```

Aktive Konsolidierung:

```text
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
```

Archiv:

```text
project-state/archive/2026-05-30-step578-dashboard-commands-state/
```

Verification:

```text
Dashboard/Commands leftovers in root: 0
Dashboard/Commands archive present: 3
Dashboard/Commands archive missing: 0
Dashboard/Commands archive extra: 0
Warnings: 0
Errors: 0
```

### Offener Root-Cleanup nach STEP582

Nach Abschluss von Batch F lagen noch temporäre aktuelle Run-Dokumente im `project-state` Root:

```text
Current run docs still in root: 29
Remaining NEXT_STEPS appends: 12
```

Diese Dateien sind reine Lauf-/Plan-/Archivierungsdokumente des aktuellen Cleanup-Durchgangs. Sie sollen im Anschluss an diesen History-Append per Dry-Run und Apply archiviert werden.

Geplanter Archivordner:

```text
project-state/archive/2026-05-30-step583-current-run-docs/
```

### Geplanter Folgeablauf

```text
STEP585 - Current Run Docs Archive Dry-Run
STEP586 - Current Run Docs Archive Apply
STEP587 - Post Current Run Docs Verification
```

### Schutzregeln

Nicht archivieren/verschieben:

```text
project-state/CHANGELOG.md
project-state/CHANNELPOINTS_CURRENT_STATE.md
project-state/COMMANDS_CURRENT_STATE.md
project-state/CURRENT_STATUS.md
project-state/FILES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/system-inspection/*_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

Produktive Dateien bleiben unangetastet:

```text
backend/**
htdocs/**
config/**
data/**
.env
secrets/**
```

### Ergebnisregel

Dieser Cleanup entfernt keine Funktionalität. Er betrifft ausschließlich Dokumentations-/Projektstandsdateien und archiviert alte Arbeitsdokumente nachvollziehbar.

<!-- /STEP584_CURRENT_RUN_DOCS_RESCUE_HISTORY_APPEND -->
"@

if (-not $alreadyPresent) {
  Add-Content -LiteralPath $historyPath -Value $append -Encoding UTF8
  $changed = $true
}

$reportTxt = Join-Path -Path $OutDir -ChildPath "step584_current_run_docs_history_append_report.txt"
$reportJson = Join-Path -Path $OutDir -ChildPath "step584_current_run_docs_history_append_report.json"

$status = [pscustomobject]@{
  generatedAt = $timestamp
  projectRoot = $ProjectRoot
  historyFile = $historyRel
  marker = $marker
  alreadyPresent = $alreadyPresent
  changed = $changed
  errors = 0
  warnings = 0
  nextStep = "STEP585 - Current Run Docs Archive Dry-Run"
}

$status | ConvertTo-Json -Depth 5 | Out-File -FilePath $reportJson -Encoding UTF8

$lines = @()
$lines += "STEP584 Current Run Docs History Append Report"
$lines += "Generated: " + $timestamp
$lines += "ProjectRoot: " + $ProjectRoot
$lines += "HistoryFile: " + $historyRel
$lines += "Marker: " + $marker
$lines += "Already present: " + $alreadyPresent
$lines += "Changed: " + $changed
$lines += "Warnings: 0"
$lines += "Errors: 0"
$lines += "NextStep: STEP585 - Current Run Docs Archive Dry-Run"
$lines | Out-File -FilePath $reportTxt -Encoding UTF8

Write-Host ""
Write-Host "STEP584 Current Run Docs History Append fertig."
Write-Host ("Already present: " + $alreadyPresent)
Write-Host ("Changed: " + $changed)
Write-Host "Warnings: 0"
Write-Host "Errors: 0"
Write-Host ("Report: " + $reportTxt)
Write-Host ("JSON: " + $reportJson)
