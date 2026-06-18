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
\n\n## SHOT-ALARM-2B – 2026-06-18\n- Shot-Alarm auf Version 0.2.1 / STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS aktualisiert.\n- DB-Config via module_settings, DB-Textvarianten via module_text_variants, History-Tabelle shot_alarm_history.\n- Dashboard jetzt unter Community / Events / Shot-Alarm mit Tabs Übersicht, Config, Texte, Tests, Statistik/Verlauf.


## SHOT-ALARM-2B.1 Dashboard Events Placement
- Shot-Alarm im Dashboard aus Community in den Bereich Events verschoben.
- Hauptnavigation bekommt Events als eigenen Bereich mit Event-System und Shot-Alarm.
- Shot-Alarm Config/Texte werden im Events-Kontext angezeigt.
- Backend/Regellogik unverändert.
