# CAN-43 Diagnostics Registry Review

## Zweck

Diese Datei dokumentiert die abgeschlossene CAN-43 Diagnose-/Registry-Runde.

Sie dient als zentrale Übersicht, welche Module geprüft wurden, welche Routen als Status-/Diagnosebasis gelten und welche bewussten Beobachtungen nicht als Fehler behandelt werden.

## Geprüfte Module

| CAN | Registry/Modul | Backend-Datei | Status |
|---:|---|---|---|
| 43.2 | `commands` | `backend/modules/commands.js` | sauber |
| 43.3 | `hug` | `backend/modules/hug.js` | sauber |
| 43.4 | `birthday` | `backend/modules/birthday.js` | sauber |
| 43.5 | `message_rotator` | `backend/modules/message_rotator.js` | sauber |
| 43.6 | `tagebuch` | `backend/modules/tagebuch.js` | sauber |
| 43.7 | `todo` | `backend/modules/todo.js` | sauber |
| 43.8 | `vip` / `vip_sound_overlay` | `backend/modules/vip-sound.js` | sauber mit dokumentierter Config-Fallback-Warnung |
| 43.9 | `alerts` / `alert_system` | `backend/modules/alert_system.js` | sauber |
| 43.10 | `sound_system` | `backend/modules/sound_system.js` | sauber mit dokumentierter Legacy-Targets-Warnung |
| 43.11 | `media` | `backend/modules/media.js` | sauber; Repair-Check nur read-only |
| 43.12 | `obs` | `backend/modules/obs.js` | sauber |
| 43.13 | `overlay_monitor` | `backend/modules/overlay_monitor.js` | sauber; Inventory-Warnungen nur Inventar-Klassifizierung |
| 43.14 | `bus_diagnostics` | `backend/modules/bus_diagnostics.js` | sauber; optionale Debug-Client-Hinweise |
| 43.15 | `communication_bus` | `backend/modules/communication_bus.js` | sauber |


## Finaler Coverage-Stand

```text
ok=True
registryEntries=14
loadedModules=52
coveredLoadedModules=14
missingLoadedModules=0
registryOnlyEntries=0
```

## Standard für neue/geänderte Module

Jedes neue oder relevant geänderte Modul muss künftig direkt erfüllen:

- `MODULE_META` sauber gesetzt
- Statusroute vorhanden
- `diagnostics`-Block vorhanden
- Registry-Eintrag vorhanden
- Coverage sauber
- Modul-Doku aktualisiert
- Project-State aktualisiert
- Keine neue Dashboard-Diagnose-Extra-Datei ohne klare Begründung
- Keine Funktionalität entfernen

## Standard-Diagnostics-Felder

Soweit passend:

```text
ok
health
module
version
build
schemaVersion
schemaReady
lastError
counts
database
state
queue
runtime
warnings
errors
```

## Batch-Regel

Für mehrere Module künftig bevorzugt:

1. Read-only-Endpunkte sammeln.
2. Export als ZIP erzeugen.
3. ZIP auswerten.
4. Kombiniertes Doku-/Handoff-ZIP erstellen.
5. Nur Fehler/404/Warnungen einzeln nachziehen.

## Bewusste Nicht-Fehler

### VIP Sound

```text
config_fallback file_not_found
```

DB-Settings sind primär; JSON-Fallback optional.

### Sound-System

```text
legacy_targets_and_output_targets_both_present
```

Legacy-Targets bleiben bewusst erhalten.

### Media

```text
repair-names changed=2
```

Nur read-only mit `apply=false`, keine Änderung.

### Overlay Monitor

```text
inventory.summary.warnings=8
```

Inventar-/Source-Klassifizierung, keine aktiven Diagnostics-Fehler.

### Bus Diagnostics

```text
sound_eventbus_debug_not_connected_optional
alert_eventbus_debug_not_connected_optional
```

Optionale Debug-Clients, kein Fehler.

### Communication Bus

```text
/api/communication/routes
/api/communication/clients
/api/communication/diagnostics
```

Einzelrouten existieren nicht; `/api/communication/status` bündelt die Daten.

## Produktive Routen

Produktive/testauslösende Routen wurden in CAN-43 nicht ausgeführt.

Dazu gehören insbesondere:

- Alert-Test/Play
- Sound-Play/Bundle/Beep
- OBS-POST-Aktionen
- Media-Scan/Upload/Update/Delete
- Overlay-Reparaturen
- Communication-Bus Test/Mirror/Reset/Forget
- Settings-POSTs

## Abschluss

CAN-43 ist als Registry-/Diagnostics-Review abgeschlossen.
