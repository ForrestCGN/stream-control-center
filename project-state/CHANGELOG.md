# CHANGELOG

Stand: 2026-06-19

## SHOT-ALARM-2E Payment History ID Fix

- `shot_alarm` auf Version `0.2.3` aktualisiert.
- Build auf `STEP_SHOT_ALARM_2E_PAYMENT_HISTORY_ID_FIX` gesetzt.
- Fehler behoben: `history_persist_failed: UNIQUE constraint failed: shot_alarm_history.id`.
- History-Einträge bekommen jetzt eigene eindeutige `historyId` / `storageId`.
- ursprüngliche Draw-ID bleibt als `id/sourceId/drawId` im Payload erhalten.
- Ko-fi/Tipeee-End-to-End-Test danach erfolgreich ohne `lastError`/`lastWarning`.
- Keine Shot-Regeln, Dashboard-Dateien oder DB-Dateien geändert.

## SHOT-ALARM-2E Ko-fi/Tipeee Payment-Bus Integration

- `backend/modules/kofi.js` auf Version `0.1.1` aktualisiert.
- `backend/modules/tipeee.js` auf Version `0.1.1` aktualisiert.
- Ko-fi veröffentlicht zusätzlich zum Alert-Forwarding auf den Communication Bus:
  - `payment.kofi.received`
- Tipeee veröffentlicht zusätzlich zum Alert-Forwarding auf den Communication Bus:
  - `payment.tipeee.received`
- Status der beiden Module enthält `paymentBus`.
- Alert-Flow bleibt erhalten.
- Shot-Alarm verarbeitet Payment-Bus-Events ohne direkte Provider-Kopplung.

## SHOT-ALARM-2D Dashboard Audit Safety

- `shot_alarm` auf Version `0.2.2` aktualisiert.
- Neue Route `GET /api/shot-alarm/dashboard-audit` ergänzt.
- Status um `safety` und `audit` erweitert.
- Schreibende Shot-Alarm-Aktionen werden auditiert.
- Kritische Aktionen brauchen `confirmWrite:true`.
- Dashboard sendet Bestätigung bei kritischen Aktionen.
- Text „Chat-Befehl kommt später“ korrigiert auf aktiven `!shotdone`-Hinweis.

## SHOT-ALARM-2C shotdone command

- `commands` auf Version `0.2.4` aktualisiert.
- Build `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`.
- Command `!shotdone` ergänzt.
- Alias `!shotgetrunken` ergänzt.
- Zielroute `POST /api/shot-alarm/shot-done`.
- Rechte über `allowedLogins`, `allowMods`, `allowBroadcaster`.

## SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost

- Dashboard-Fix für `Community → Event-System → Config`.
- Config-Bereich-Dropdown ergänzt: `Event-System` / `Shot-Alarm`.
- Event-System-Config bleibt vollständig erhalten.
- Shot-Alarm-Config ist zusätzlich getrennt auswählbar.
- Wechsel im Dropdown löscht keine Einstellungen.
- Keine Backend-/DB-/Regeländerung.

## SHOT-ALARM-2B.5 Event-System Shot Tab + Config Dropdown

- Shot-Alarm als eigener Tab innerhalb `Community → Event-System` ergänzt.
- Texte bleiben im bestehenden Event-System-Texte-Tab.
- Textbereich-Dropdown um `Shot-Alarm Chat` und `Shot-Alarm Overlay` erweitert.
- Config-Bereich-Dropdown vorbereitet.
- Keine Backend-/DB-/Regeländerung.

## SHOT-ALARM-2B DB Texts Config Helpers

- Shot-Alarm auf Version `0.2.1` aktualisiert.
- DB-Config über `module_settings` / `helper_settings`.
- DB-Textvarianten über `module_text_variants` / `helper_texts`.
- `shot_alarm_history` ergänzt.
- Statistikroute ergänzt.

## SHOT-ALARM-2A Aggregated Draw Overlay Counter

- Auslosung pro Support-Event gebündelt.
- 10-Sekunden-Auslosungsphase ergänzt.
- Ergebnisphase mit einem Overlay, einem Sound und einer gebündelten Chatnachricht.
- Runtime-Counter `shotsOpen`, `shotsDrunk`, `shotsAddedTotal` ergänzt.
- Overlay-Statusleiste unten ergänzt.
