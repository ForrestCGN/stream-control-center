# STEP193.17.2 - SoundAlerts Final Documentation Sync

Stand: 2026-05-06

## Ziel

Zentrale Projekt-Dokumentation nach dem aktuellen SoundAlerts-Stand synchronisieren.

Dieser STEP ist ein reiner Doku-STEP nach:

- `STEP193.16` Entry Editor Output/Selection Fix
- `STEP193.17` Output Field Cleanup
- `STEP193.17.1` Filter Regression Fix

## Technischer Stand

- `soundalerts_bridge` Version: `0.1.14`
- Aktive DB: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- Settings-Tabelle: `soundalerts_bridge_settings`
- Events-Tabelle: `soundalerts_bridge_events`
- Eintraege-Tabelle: `soundalerts_bridge_entries`
- Meta-Tabelle: `soundalerts_bridge_meta`

## Dokumentierte Fachregeln

### Parser

- `parser.messageFormats` ist dashboardfaehig.
- Speicherort: `soundalerts_bridge_settings`.
- Wert muss als echtes Objekt-Array erhalten bleiben.
- `[object Object]` ist ein kaputter Zustand und darf nicht wieder entstehen.

### Eintraege / Review

- Neue automatisch erkannte Eintraege bleiben `Zur Pruefung`, bis sie einzeln gespeichert/freigegeben werden.
- Globales Speichern darf keine anderen Review-Eintraege freigeben.
- Inaktive vollstaendige Eintraege sind kein offener Handlungsbedarf.
- Datei-fehlt-Eintraege sind offene Einrichtung, bis eine Datei zugeordnet wurde.

### Ausgabeziel

- Das Ausgabeziel wird im Eintrag-Editor nicht mehr manuell gepflegt.
- Audio nutzt das globale Audio-Ziel.
- Video nutzt das globale Video-Ziel.
- Normaler Test nutzt das gespeicherte Ziel.
- Overlay-Test darf temporaer `outputTarget=overlay` senden.

### Filter

- Filter funktionieren wieder fuer:
  - Alle
  - Aktiv
  - Inaktiv
  - Zur Pruefung
  - Datei fehlt
  - Ignoriert

## Aktualisierte Dateien

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP193_17_2_SOUNDALERTS_FINAL_DOC_SYNC_2026-05-06.md`

## Keine Aenderung an

- Backend-Code
- Dashboard-Code
- API-Routen
- DB-Schema
- Config-Dateien
- Overlay-Dateien

## Bewusst offen

Naechster empfohlener Schritt:

```text
Sound-System Overlay Bugs bereinigen
```

Betroffene Datei fuer den naechsten technischen STEP voraussichtlich:

```text
htdocs/overlays/sound_system_overlay.html
```

Zu pruefen:

- Audio/Video-Verhalten im lokalen Overlay.
- Overlay-Test mit temporaerem `outputTarget=overlay`.
- Status-/Debuganzeige.
- Ob und wann das Overlay neue Dateien/Status ohne Reload erkennt.
