# NEXT_STEPS

## Shot-Alarm nächste Schritte

1. STEP 2A einspielen, StepDone nach Deploy ausführen, Backend neu starten, testen.
2. `!shotdone`/Shot-getrunken-Befehl über vorhandenes Command-/Chat-System anbinden.
3. Rechteprüfung für Engel/Roxxy/Broadcaster/Mods klären und umsetzen.
4. Textvarianten aus Config-Fallback in vorhandenes DB-/Textsystem überführen.
5. Dashboard-Editor für Shot-Alarm Texte, Sounds, Regeln und Statistik ausbauen.
6. Ko-fi/Tipeee-Module sauber über Payment-Bus-Events an Shot-Alarm anbinden.
7. Persistente Statistik in DB planen/umsetzen.
\n\n## SHOT-ALARM-2B – 2026-06-18\n- Shot-Alarm auf Version 0.2.1 / STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS aktualisiert.\n- DB-Config via module_settings, DB-Textvarianten via module_text_variants, History-Tabelle shot_alarm_history.\n- Dashboard jetzt unter Community / Community / Event-System / Shot-Alarm mit Tabs Übersicht, Config, Texte, Tests, Statistik/Verlauf.


## Shot-Alarm nächste Schritte
- Event-Bereich weiter vereinheitlichen: zentrale Dropdowns für Event-Module prüfen/ausbauen.
- Shot-Alarm Chat-Command `!shotdone` über vorhandenes Command-/Chat-System planen.
- Ko-fi/Tipeee Payment-Bus separat anbinden.


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
