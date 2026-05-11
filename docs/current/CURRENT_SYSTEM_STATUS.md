# Current System Status – stream-control-center

Stand: 2026-05-11

## DeathCounter V2

Der DeathCounter V2 ist auf produktiven DB-Storage umgestellt und als stabil bestätigt.

Aktiver Zustand:

- `activeStorage: database`
- `dualWriteEnabled: false`
- JSON nur noch manuell per Backup/Export
- `!dcount backup` erstellt Timestamp-Backup
- `!dcount export` schreibt die Haupt-JSON aus dem aktuellen DB-Stand

Overlay:

- `_overlay-deathcounter-v2.html` nutzt weiterhin `/api/deathcounter/v2/state` und `/api/deathcounter/v2/overlay`.
- STEP262 hat den DeathCounter optisch an den Alert-Außenrahmen angepasst.
- STEP263 hat die Slide-/Fade-Transition minimal verlangsamt.
- Keine Overlay-Funktionalität wurde entfernt.
