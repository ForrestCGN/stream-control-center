# STEP233 - Projekt-Doku Archivierung vorbereiten

Stand: 2026-05-11

## Ziel

Alte Doku-Fragmente aus den aktiven Einstiegsebenen entfernen, ohne Inhalte zu verlieren.

## Hintergrund

Die Projektanalyse aus STEP232 hat gezeigt, dass vor allem diese Dateitypen die Orientierung erschweren:

- `*_APPEND_*`
- `CURRENT_STATUS_APPEND_STEP*`
- `*_STATUS_NOTE_*`
- `NEXT_CHAT_HANDOFF_*`
- alte Handoff-Dateien
- alte JSON-Backups unter `project-state`

## Umfang

Das Archiv-Move-Script umfasst 187 geprüfte Kandidaten.

## Neue Datei

```text
tools/archive_docs_step233.ps1
docs/archive/2026-05-11/STEP233_ARCHIVE_MANIFEST_2026-05-11.txt
```

## Vorgehen

Nach dem Entpacken dieses ZIPs im Repo-Root:

```powershell
cd D:\Git\stream-control-center
.\tools\archive_docs_step233.ps1
git status --short
.\stepdone.cmd "archive old project documentation fragments"
```

## Wichtig

- Es wird nichts inhaltlich gelöscht.
- Dateien werden nur verschoben.
- Zielordner sind:
  - `project-state/archive/2026-05-11-step233/`
  - `docs/archive/2026-05-11-step233/`
- Aktive Einstiegspunkte bleiben direkt sichtbar:
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`

## Bewusst nicht archiviert

- historische Analyse-Snapshots unter `docs/backend`, `docs/dashboard`, `docs/database`, `docs/overlays`, `docs/system-inspection`
- echte STEP-Hauptdokumente ohne Append-/Status-Note-Muster
- Code, Configs, DB-Dateien, Dashboard, Backend, Overlays
