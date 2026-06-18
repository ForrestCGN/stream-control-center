# CURRENT_STATUS

## Shot-Alarm

Aktueller Stand: `SHOT-ALARM-2A Aggregated Draw Overlay Counter`

- Backend-Modul `shot_alarm` Version 0.2.0.
- Communication-Bus-Consumer für Twitch-Support-Events aktiv.
- Auslosung pro Support-Event wird gebündelt.
- 10 Sekunden Auslosungsphase vor Ergebnis.
- Ergebnis erhöht `shotsOpen` erst nach der Auslosung.
- Overlay oben: kleine Ergebnis-/Auslosungskarte.
- Overlay unten: dezente permanente Statusleiste mit offen/getrunken/gesamt.
- Chat-Texte im Altersheim-/Heimleitungsstil über Config-Textpools.
- Sound nur einmal pro Treffer-Ergebnis.

Ko-fi/Tipeee sind vorbereitet, aber noch nicht produktiv über Payment-Bus angebunden.
\n\n## SHOT-ALARM-2B – 2026-06-18\n- Shot-Alarm auf Version 0.2.1 / STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS aktualisiert.\n- DB-Config via module_settings, DB-Textvarianten via module_text_variants, History-Tabelle shot_alarm_history.\n- Dashboard jetzt unter Community / Community / Event-System / Shot-Alarm mit Tabs Übersicht, Config, Texte, Tests, Statistik/Verlauf.


## Shot-Alarm Dashboard-Placement
Shot-Alarm ist als Event-Modul unter Events eingeordnet. Config und Texte bleiben im Shot-Alarm-Modul, werden aber im Events-Kontext angezeigt. Backend-Status bleibt 0.2.1 / STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS.


## STEP SHOT-ALARM-2B.2 Dashboard Community Event-System Placement

- Separater linker Hauptnavigationspunkt `Events` entfernt.
- `Event-System` liegt wieder als Karte im Bereich `Community`.
- `Shot-Alarm` bleibt als Event-Untermodul vorhanden, aber nicht als eigener Hauptnavigationspunkt.
- Texte/Config sollen im Event-System-Kontext über vorhandene Modul-/Bereichs-Dropdowns weitergeführt werden.
- Backend, Regeln, DB-Texte, DB-Config, Overlay und Counter wurden nicht geändert.
