# CHANGELOG

Stand: 2026-06-19

## SHOT-ALARM-2D Dashboard Audit Safety

- `shot_alarm` Version auf `0.2.2` erhöht.
- Build gesetzt auf `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- Neue Route ergänzt: `GET /api/shot-alarm/dashboard-audit`.
- Status um `safety` und `audit` erweitert.
- Schreibende Shot-Alarm-Aktionen werden auditiert:
  - Config speichern
  - Texte speichern/löschen
  - Test auslösen
  - manueller Trigger
  - offene Auslosungen auflösen
  - Shot getrunken
  - Pending flush
  - Runtime reset
- Kritische Aktionen brauchen `confirmWrite:true`:
  - `manual-trigger`
  - `resolve-pending`
  - `flush-pending`
  - `reset-state`
- Dashboard sendet `confirmWrite:true` bei kritischen Aktionen.
- Event-System-Shot-Tab zeigt Safety-/Audit-Infos.
- Text `Chat-Befehl kommt später` wurde auf `!shotdone ist aktiv` korrigiert.
- Keine Änderung an Shot-Regeln.
- Keine DB-Datei ersetzt.
- Keine Event-System-Hauptlogik entfernt.
- Keine Ko-fi/Tipeee-Anbindung umgesetzt.

Tests:

- `node -c backend/modules/shot_alarm.js` erfolgreich.
- `node -c htdocs/dashboard/modules/stream_events.js` erfolgreich.
- `node -c htdocs/dashboard/modules/shot_alarm.js` erfolgreich.
- `/api/shot-alarm/status` zeigt `moduleVersion=0.2.2` und Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- `/api/shot-alarm/dashboard-audit?limit=10` funktioniert.
- `POST /api/shot-alarm/resolve-pending` ohne `confirmWrite` wird mit `confirm_write_required` blockiert.
- `POST /api/shot-alarm/resolve-pending` mit `confirmWrite:true` läuft erfolgreich durch.
- Audit enthält erlaubte und verweigerte Aktion.

Hinweis:

- Kleiner Cleanup-Punkt: Audit-Action-Namen vereinheitlichen (`shot_alarm.resolve_pending` statt Mischung aus `_` und `-`).

## SHOT-ALARM-2C shotdone command

- `!shotdone` über das bestehende Command-System angebunden.
- Alias `!shotgetrunken` ergänzt.
- Command-System Version auf `0.2.4` erhöht.
- Build gesetzt auf `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`.
- Command-Catalog um `Shot-Alarm → Shot getrunken melden` ergänzt.
- Seed-Command für `shotdone` ergänzt.
- Zielroute: `POST /api/shot-alarm/shot-done`.
- Permission-Logik erweitert für explizite `allowedLogins`.
- Standard erlaubt: `engelcgn`, `roxxyfoxxy`, Broadcaster, Mods.
- Keine Änderung an `shot_alarm.js`.
- Keine Änderung an Shot-Regeln, Dashboard, DB, Event-System-Config oder Overlay.

Tests:

- `node -c backend/modules/commands.js` erfolgreich.
- `/api/commands/status` zeigt `moduleVersion=0.2.4` und Build `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`.
- `/api/commands/test?message=!shotdone&user=EngelCGN&role=vip` erkennt Command korrekt und erlaubt EngelCGN über `allowedLogins`.
- `/api/commands/execute?message=!shotdone&user=EngelCGN&role=vip` führt erfolgreich gegen `shot_alarm` aus.
- Testevent `10.000 Bits` erzeugt 1 sicheren Shot.
- Danach wurde `!shotdone` erfolgreich ausgeführt.

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
