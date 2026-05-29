# STEP534 – Current STEP Docs Konsolidierung Batch 2

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Alte `docs/current/STEP*.md`-Einzeldokumente werden in eine Sammeldoku zusammengeführt und danach aus `docs/current/` verschoben.

## Neue Sammeldoku

```text
docs/current/CURRENT_STEP_HISTORY_CONSOLIDATED.md
```

## Betroffene Themen

- Alert Provider Safety / Tipeee-Twitch-Mirror
- Alert global disable / Queue-Gate
- Twitch Sub/Gift/Resub/Gift-Bomb-Regeln
- Alert TTS
- Alert Message Text Settings
- Message-Rotator Backend Scheduler
- VIP Bus Mode Handoff STEP432 → STEP433

## Anwendung

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
git diff -- docs/current/CURRENT_STEP_HISTORY_CONSOLIDATED.md
```

Dry-Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_current_step_docs_step534.ps1
```

Wenn der Dry-Run nur erwartete Dateien zeigt:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_current_step_docs_step534.ps1 -Apply
```

Danach:

```powershell
git status
git diff --stat
```

## Erwartung

- neue Sammeldoku
- alte Einzel-STEP-Dokus gelöscht/verschoben
- STEP534-Dokus/Skript neu
- `_cleanup_quarantine/` bleibt ignoriert

## Nicht betroffen

- keine Backend-Dateien
- keine Dashboard-Dateien
- keine Configs
- keine SQLite/Secrets/Tokens
