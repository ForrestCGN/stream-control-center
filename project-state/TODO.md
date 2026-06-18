# TODO

## Shot-Alarm

- [ ] STEP 2A live testen.
- [ ] Overlay in OBS prüfen: obere Karte nicht zu groß, Statusleiste unten unauffällig.
- [ ] Chat-Ausgaben im Stream prüfen.
- [ ] Soundpool durch echte Shot-Sounds ersetzen.
- [ ] `!shotdone` Command anbinden.
- [ ] Berechtigungen für Engel/Roxxy festlegen.
- [ ] DB-basierte Textvarianten bauen.
- [ ] Statistik persistieren.
- [ ] Ko-fi/Tipeee Payment-Bus anbinden.
\n\n## SHOT-ALARM-2B – 2026-06-18\n- Shot-Alarm auf Version 0.2.1 / STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS aktualisiert.\n- DB-Config via module_settings, DB-Textvarianten via module_text_variants, History-Tabelle shot_alarm_history.\n- Dashboard jetzt unter Community / Community / Event-System / Shot-Alarm mit Tabs Übersicht, Config, Texte, Tests, Statistik/Verlauf.


## Shot-Alarm TODO
- [x] Dashboard-Placement: Shot-Alarm unter Events statt Community.
- [ ] Zentrale Event-Config-/Event-Texte-Dropdowns später bei Bedarf vereinheitlichen.


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
