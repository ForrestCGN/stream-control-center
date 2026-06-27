# CAN-43.16 Diagnostics Registry Consolidation

Stand: 2026-06-03 15:15

## Ziel

CAN-43.16 schließt die CAN-43 Diagnose-/Registry-Runde als Konsolidierungsstep ab.

Dieser Step fasst alle geprüften Registry-/Diagnosemodule zusammen, dokumentiert den final bekannten Coverage-Stand, hält bewusste Beobachtungen fest und definiert die nächste Arbeitsrichtung.

Dieser Step ist ein reiner Doku-/Abschluss-Step.

## Ergebnis

Die CAN-43 Diagnose-/Registry-Runde für die wichtigsten Registry-Module ist abgeschlossen.

- 14 Registry-Module geprüft.
- 14 Registry-Einträge bestätigt.
- 52 geladene Module im Coverage-Stand berücksichtigt.
- 14 geladene Module durch Registry abgedeckt.
- 0 fehlende geladene Module.
- 0 Registry-only Einträge.
- Keine produktiven Testflows ausgelöst.
- Keine Backend-Codeänderung in den Review-Steps.
- Keine Dashboard-Codeänderung in den Review-Steps.
- Keine DB ersetzt oder neu gebaut.
- Doku-/Handoff-/Project-State-Dateien fortlaufend aktualisiert.

## Finaler bestätigter Coverage-Stand

Letzter bestätigter Stand aus CAN-43.15:

```text
ok=True
registryEntries=14
loadedModules=52
coveredLoadedModules=14
missingLoadedModules=0
registryOnlyEntries=0
```

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


## Bewusst dokumentierte Beobachtungen

### `vip_sound_overlay`

- Registry-Key: `vip`
- Echte Backend-Datei: `backend/modules/vip-sound.js`
- Öffentliche Statusroute: `/api/vip-sound/status`
- Eine Warnung im Integration-Check wurde dokumentiert:
  - `config_fallback=False file_not_found`
- Bewertung:
  - Kein Fehler.
  - DB-Settings sind primär.
  - JSON-Fallback ist optional.

### `sound_system`

- Warnung:
  - `legacy_targets_and_output_targets_both_present`
- Bewertung:
  - Kein Fehler.
  - `output.targets` ist das aktive Output-Modell.
  - `targets` bleibt für Legacy-Kompatibilität erhalten.
  - Nicht entfernen, bis alle Caller migriert sind.

### `media`

- Repair-Namen-Check wurde nur read-only ausgeführt:
  - `apply=False`
  - `renameFiles=False`
  - `changed=2`
- Bewertung:
  - Kein Fehler.
  - Keine DB-Änderung.
  - Keine Datei-Umbenennung.
  - Zwei potenzielle Namenskorrekturen nur dokumentiert.

### `obs`

- Separater Replay-Statusblock wurde in der Live-Ausgabe nicht mehr angezeigt.
- Status/Diagnostics bestätigten trotzdem:
  - `replayBufferActive=False`
- Bewertung:
  - Kein Fehler.
  - Keine Replay-Aktion ausgelöst.

### `overlay_monitor`

- `inventory.summary.warnings=8`
- Bewertung:
  - Keine aktiven Diagnostics-Warnings.
  - Keine aktiven Issues.
  - Inventar-/Source-Klassifizierungen, nicht aktive Systemfehler.
  - Keine OBS-Reparatur ausgelöst.

### `bus_diagnostics`

- Optionale Hinweise:
  - `sound_eventbus_debug_not_connected_optional`
  - `alert_eventbus_debug_not_connected_optional`
- Bewertung:
  - Kein Fehler.
  - Debug-Clients sind optional.
  - Summary bleibt `ok`.

### `communication_bus`

- Nicht vorhandene Einzelrouten:
  - `/api/communication/routes`
  - `/api/communication/clients`
  - `/api/communication/diagnostics`
- Bewertung:
  - Kein Fehler.
  - `/api/communication/status` bündelt Routenliste, Clients, Events und Diagnostics vollständig.

## Produktive Routen bewusst nicht ausgelöst

Während CAN-43 wurden bewusst nicht ausgelöst:

- Alert-Auslösung
- Sound-Play / Beep / Bundle
- OBS-Szenenwechsel
- OBS-Source Show/Hide/Toggle
- OBS-Audio-Aktionen
- Replay Start/Stop/Save
- Media Scan/Upload/Update/Delete
- Overlay-Monitor OBS-Reparatur
- Communication-Bus Testevent/Testalert/Mirror/Reset/Forget
- VIP-Overlay-Test
- Dashboard-Config-POSTs
- Settings-Änderungen
- DB-Rebuilds
- Datenbank-Ersetzungen

## Wiederverwendbarer Batch-Ansatz

Für künftige Runden gilt:

- Mehrere Module gemeinsam exportieren.
- Nur Read-only-Routen verwenden.
- Ausgabe in ZIP sammeln.
- Ich werte den Batch komplett aus.
- Nur Fehler/404/Warnungen werden einzeln nachgezogen.

Bewährte Exportstruktur:

```text
diagnostics_exports/<STEP>_<timestamp>/
  *_status.json
  *_routes.json
  *_integration-check.json
  *.ERROR.txt
  summary.txt
```

## Geänderte Dateien in CAN-43.16

- `docs/current/CAN-43.16_diagnostics_registry_consolidation.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_16.md`
- `docs/modules/DIAGNOSTICS_REGISTRY_REVIEW_CAN43.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Nicht geändert

- Kein Backend-Code.
- Keine Dashboard-Datei.
- Keine Datenbank.
- Keine Registry.
- Keine Modulversion.
- Keine Config.
- Keine Texte.
- Keine produktiven Flows.

## Abschlussbewertung

CAN-43 kann als Diagnose-/Registry-Review-Runde abgeschlossen werden.

Empfohlener nächster Arbeitsmodus:

1. Zurück zur Feature-/Umbauplanung im Control-Center.
2. Neue Module nur noch mit direkter Diagnose-/Registry-/Doku-Pflicht einbauen.
3. Bei größeren Änderungen Batch-Exports statt Einzel-Copy/Paste verwenden.
