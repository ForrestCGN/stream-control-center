# CHANGELOG

## SHOT-ALARM-2A Aggregated Draw Overlay Counter

- Shot-Alarm von Einzeltriggern auf gebündelte Ergebnisse umgebaut.
- 10-Sekunden-Auslosungsphase ergänzt.
- Ergebnisphase mit einmaligem Overlay, einmaligem Sound und gebündelter Chatnachricht ergänzt.
- Runtime-Counter `shotsOpen`, `shotsDrunk`, `shotsAddedTotal` ergänzt.
- Overlay-Statusleiste unten ergänzt.
- Ergebnis-Overlay kleiner und in die obere Bildschirmhälfte verschoben.
- Altersheim-/Heimleitungs-Textpools in Config ergänzt.
- Routen für Statusbar, Pending-Auflösung und Shot-Done ergänzt.
\n\n## SHOT-ALARM-2B – 2026-06-18\n- Shot-Alarm auf Version 0.2.1 / STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS aktualisiert.\n- DB-Config via module_settings, DB-Textvarianten via module_text_variants, History-Tabelle shot_alarm_history.\n- Dashboard jetzt unter Community / Community / Event-System / Shot-Alarm mit Tabs Übersicht, Config, Texte, Tests, Statistik/Verlauf.


## SHOT-ALARM-2B.2 Dashboard Community Event-System Placement
- Shot-Alarm im Dashboard aus Community in den Bereich Events verschoben.
- Hauptnavigation bekommt Events als eigenen Bereich mit Event-System und Shot-Alarm.
- Shot-Alarm Config/Texte werden im Events-Kontext angezeigt.
- Backend/Regellogik unverändert.


## STEP SHOT-ALARM-2B.2 Dashboard Community Event-System Placement

- Separater linker Hauptnavigationspunkt `Events` entfernt.
- `Event-System` liegt wieder als Karte im Bereich `Community`.
- `Shot-Alarm` bleibt als Event-Untermodul vorhanden, aber nicht als eigener Hauptnavigationspunkt.
- Texte/Config sollen im Event-System-Kontext über vorhandene Modul-/Bereichs-Dropdowns weitergeführt werden.
- Backend, Regeln, DB-Texte, DB-Config, Overlay und Counter wurden nicht geändert.

## SHOT-ALARM-2B.3 Dashboard Event-System Modul-Dropdowns
- Shot-Alarm bleibt unter Community → Event-System.
- Texte/Config bekommen Modul-Auswahl Event-System / Shot-Alarm.
- Backend/Regeln/Overlay unverändert.


## STEP SHOT-ALARM-2B.4 Dashboard sichtbarer Event-Modul-Picker
- Event-System bleibt unter Community.
- In Texte/Config gibt es weiterhin den Modul-Dropdown.
- Zusätzlich sind Event-System und Shot-Alarm als sichtbare Schnellwahl-Buttons vorhanden, damit Shot-Alarm nicht versteckt/fehlend wirkt.
- Keine Backend-/Regeländerung.


## STEP SHOT-ALARM-2B.5 Event-System Shot Tab + Config Dropdown

- Korrigiert die Dashboard-Einordnung: Shot-Alarm ist jetzt ein eigener Tab innerhalb `Community → Event-System`.
- Texte bleiben im bestehenden Event-System-Texte-Tab und werden über die vorhandenen Textbereich-Dropdowns als `Shot-Alarm Chat` und `Shot-Alarm Overlay` ausgewählt.
- Config bleibt im bestehenden Event-System-Config-Tab; dort wurde ein Config-Bereich-Dropdown ergänzt (`Event-System` / `Shot-Alarm`).
- Backend, DB-Schema, Shot-Regeln, Auslosung, Overlay, Sound und History wurden nicht geändert.

