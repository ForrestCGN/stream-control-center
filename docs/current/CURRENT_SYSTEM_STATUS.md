# CURRENT_SYSTEM_STATUS - DeathCounter DB-Storage STABLE + Overlay STEP262

Stand: 2026-05-11

## Wichtigster aktueller Projektstand

DeathCounter V2 laeuft produktiv auf DB-Storage und ist nach Live-Test als stabil bestaetigt.

```text
activeStorage: database
configuredStorage: database
fallbackStorage: json_backup_export_file
databaseReadable: true
dualWriteEnabled: false
jsonFallbackEnabled: true
```

## DeathCounter Overlay

Das aktive DeathCounter-Overlay wurde in STEP262 optisch angepasst:

```text
htdocs/overlays/_overlay-deathcounter-v2.html
```

Neu im Overlay:

```text
- Alert-aehnlicher CGN-Aussenrahmen
- Cyan/Lila-Verlauf wie beim Alert-Design
- dunkler Glass-/Neon-Hintergrund
- kein zusaetzlicher Innenrahmen der Haupt-Bar
- Einblendung von oben per Slide-In
- Ausblendung nach oben per Slide-Out
```

Unveraendert im Overlay:

```text
- API: /api/deathcounter/v2/state
- API: /api/deathcounter/v2/overlay
- WebSocket-Events deathcounter_v2_*
- 5s Polling-Fallback
- Marquee fuer lange Namen
- Zusatzspieler-Layout
- Count-/Name-Animationen
```

## DeathCounter Storage Verhalten

```text
readState(): DB-first
updateState(): DB-only
```

JSON wird nicht automatisch bei jeder Aenderung mitgeschrieben.

Backup/Export:

```text
!dcount backup
!dcount export
/api/deathcounter/v2/storage/backup
/api/deathcounter/v2/storage/export?mode=backup
/api/deathcounter/v2/storage/export?mode=export
```

## Aktive Referenzdokus

```text
docs/current/DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/NEXT_STEPS.md
project-state/STEP262_DEATHCOUNTER_OVERLAY_ALERT_FRAME_SLIDE_2026-05-11.md
```
