# CURRENT_STATUS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-22 – Dashboard Safety View

## Aktueller bestätigter/gelieferter Stand

```text
MODULE_VERSION: 0.5.14
MODULE_BUILD: STEP_EVS_22_DASHBOARD_SAFETY_VIEW
```

## Bestätigt bis EVS-21

- EVS-19e: Sound/Text Parallel-UND-Regel fachlich bestätigt. Eine Chatnachricht kann Sound UND Text lösen.
- EVS-20: ChatOutput Dispatcher Prep bestätigt. Outputs werden gefunden, geprüft und blockiert.
- EVS-21: Event Archive/Delete Lifecycle bestätigt.
  - Aktives Event archivieren wird blockiert.
  - Finished Event archivieren funktioniert und erhält Werte.
  - Delete ohne Confirm wird blockiert.
  - Delete mit JSON-Body `{ "confirm": "DELETE" }` funktioniert.

## EVS-22 geliefert

- Neuer Dashboard-Tab `Sicherheit`.
- ChatOutput Safety View mit TESTMODUS/LIVE AKTIV.
- Blockiergründe und Output-Preview sichtbar.
- Event-Lifecycle-Aktionen sichtbar.
- Archivieren nur bei `finished`.
- Löschen mit DELETE-Eingabe.

## Weiterhin NICHT produktiv aktiv

- Keine direkte Twitch-Ausgabe.
- Kein direktes Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Kein Live-Sendeschalter aktiv.
