# STEP181.8 - Hug/Rehug Doku-Sync

Stand: 2026-05-05

## Ziel

Der aktuelle Hug/Rehug-Stand nach STEP181 wird in den zentralen Projekt-Dokus verankert.

## Kontext

Live wurde erfolgreich bestaetigt:

```text
GET /api/hug/status
ok: true
schemaVersion: 3
hugTextPairs: 30
activeHugTextPairs: 30
```

Git-Status war nach Abschluss clean.

## Aktualisierte Dateien

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP181_8_HUG_REHUG_DOC_SYNC_2026-05-05.md
```

## Dokumentierter Stand

### Hug/Rehug Backend

- `backend/modules/hug.js`
- Schema-Version 3
- neue Tabelle `hug_text_pairs`
- `hug_pending_rehugs.pair_id`
- 30 migrierte aktive Textpaare
- `!hug` zieht ein aktives Textpaar
- `!rehug` nutzt exakt die gespeicherte `pair_id`

### Hug/Rehug Dashboard

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- Bedienung vereinfacht:
  - Text
  - Antwort-Text
  - Aktiv/Inaktiv
  - Gewichtung
  - Sortierung
- Typen-Komplexitaet aus der Bedienung entfernt.

### Standardabschluss

Nach manuellem ZIP-Entpacken gilt fuer dieses Projekt:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "commit beschreibung"
```

## Bewusst nicht geaendert

- Keine historischen Analyse-Snapshots ueberschrieben.
- Keine SQLite-Datei angefasst.
- Keine Secrets/ENV/Backups committed.
- Keine bestehende Funktionalitaet entfernt.

## Naechster sinnvoller Schritt

STEP182:

- Hug/Rehug-Dashboard im Browser live pruefen.
- Ein Textpaar testweise bearbeiten, speichern, neu laden und zuruecksetzen.
- Danach ggf. kleinen UX-Fix machen.
