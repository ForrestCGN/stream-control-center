# Stats and Reports Cleanup Summary Current

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_2_DEV_SAFE_DELETE_AND_MERGE`

## Befund

Im gelieferten `stream-control-center` Snapshot wurden 348 Stats-/Report-/Generated-/Scan-Kandidaten gefunden.

Das ist zu viel fuer einen blinden Loesch-Step. Die Dateien muessen thematisch konsolidiert werden:

| Bereich | Entscheidung |
|---|---|
| `project-state/` Root | in Step 2 per exakter Liste bereinigen |
| Runtime-Backups in `backend/` und `htdocs/` | in Step 2 per exakter Liste bereinigen |
| `docs/archive/**` | spaeter paketweise pruefen; nicht aktive Wahrheit |
| `docs/current/RDAP*.md`, `CAN*.md`, alte Handoff-Dateien | spaeter gegen aktuelle Startdateien konsolidieren |
| `docs/system-inspection/**` | spaeter zusammenfuehren oder archivieren |
| `docs/_generated/**` | regenerierbar/alt; spaeter pruefen und ggf. entfernen |

## Aktueller Cleanup-Schnitt

Step 2 entfernt nur die klaren Root-/Backup-Altlasten.  
Der grosse Docs-Archiv-Cleanup kommt danach, damit keine fachliche Info aus alten Handovers verloren geht.

## Naechster sinnvoller Step

```text
RDAP_DOCS_CLEANUP_3_DOCS_CURRENT_CONSOLIDATION
```

Ziel:

- aktuelle `docs/current` Dateien gegen Startdateien und Module pruefen
- alte RDAP-/CAN-/EVS-Handoff-Dateien zusammenfuehren
- uebrige Altdateien paketweise loeschen oder nach `docs/archive/legacy/` verschieben
- Modul-Doku fachlich nachziehen
