# CHANGELOG

Stand: 2026-06-18

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
