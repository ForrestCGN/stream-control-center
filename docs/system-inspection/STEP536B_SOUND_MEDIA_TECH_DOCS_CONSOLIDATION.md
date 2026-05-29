# STEP536B – Sound/Media/SoundBus Tech Docs Consolidation

Version: 0.1.0  
Stand: 2026-05-29

## Ziel

Sound-/Media-/SoundBus-/Discord-Media-STEP-Dokus werden in eine Sammeldoku überführt.

## Neue Sammeldoku

```text
docs/backend/SOUND_MEDIA_TECH_HISTORY_CONSOLIDATED.md
```

## Quarantine-Skript

```text
tools/system-inspection/quarantine_sound_media_tech_docs_step536b.ps1
```

## Anwendung

Nach Entpacken:

```powershell
cd D:\Git\stream-control-center
git diff -- docs/backend/SOUND_MEDIA_TECH_HISTORY_CONSOLIDATED.md
```

Dry-Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_sound_media_tech_docs_step536b.ps1
```

Wenn nur erwartete Sound-/Media-Dateien als `WOULD_MOVE` auftauchen:

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\system-inspection\quarantine_sound_media_tech_docs_step536b.ps1 -Apply
```

Danach:

```powershell
git status
git diff --stat
```

## Wichtig

Die offenen SoundBus- und Dashboard-Punkte wurden in der Sammeldoku gerettet.

## Nicht betroffen

- keine Backend-Runtime-Datei
- keine Dashboard-Runtime-Datei
- keine Config
- keine SQLite/Secrets/Tokens
