# CHANGELOG

Stand: 2026-06-19

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
