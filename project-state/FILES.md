# FILES

## Shot-Alarm

- `backend/modules/shot_alarm.js` – Backend-Regeln, Bus-Consumer, Auslosung, Counter, Chat/Sound/Overlay-Ausgabe.
- `config/shot_alarm.json` – Regeln, Zeiten, Texte, Soundpool, Chat-/Overlay-Config.
- `htdocs/dashboard/modules/shot_alarm.js` – Dashboard-Modul.
- `htdocs/dashboard/modules/shot_alarm.css` – Dashboard-Styles.
- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html` – OBS-Overlay mit Statusleiste.
- `docs/modules/shot_alarm.md` – Moduldokumentation.
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2A.md` – Übergabe für Folgechat.
\n\n## SHOT-ALARM-2B – 2026-06-18\n- Shot-Alarm auf Version 0.2.1 / STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS aktualisiert.\n- DB-Config via module_settings, DB-Textvarianten via module_text_variants, History-Tabelle shot_alarm_history.\n- Dashboard jetzt unter Community / Community / Event-System / Shot-Alarm mit Tabs Übersicht, Config, Texte, Tests, Statistik/Verlauf.


## Shot-Alarm Dashboard Placement Dateien
- htdocs/dashboard/app.js
- htdocs/dashboard/index.html
- htdocs/dashboard/modules/shot_alarm.js


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



## SHOT-ALARM-2B.6

- `htdocs/dashboard/modules/stream_events.js` – sicherer Config-Dropdown Event-System/Shot-Alarm.
- `htdocs/dashboard/modules/stream_events.css` – kleine Styles für Config-Auswahl.
