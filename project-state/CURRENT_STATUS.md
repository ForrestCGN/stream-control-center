# CURRENT_STATUS

Stand: 2026-06-18

## Shot-Alarm

Aktueller geprüfter Stand: **SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost**

Backend:

- `backend/modules/shot_alarm.js`
- Modulversion: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`

Dashboard-Fix:

- `SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost`

## Funktionsstand

Shot-Alarm ist als Event-Untermodul im Event-System eingebunden:

`Community → Event-System → Shot-Alarm`

Zusätzlich:

- Texte unter `Community → Event-System → Texte`
  - Textbereiche `Shot-Alarm Chat` und `Shot-Alarm Overlay`
- Config unter `Community → Event-System → Config`
  - Config-Bereich-Dropdown `Event-System` / `Shot-Alarm`
  - Event-System-Config bleibt vollständig erhalten.
  - Shot-Alarm-Config ist separat auswählbar.

## Geprüfte Regeln

- Einzel-Sub/Resub/GiftSub: 20 %
- jeder 5. einzelne Sub/Resub/GiftSub: 50/50
- jeder 10. einzelne Sub/Resub/GiftSub: 100 %
- 5er Bombe: 50/50
- je 10 Subs in Bombe: 1 sicherer Shot
- 100er Bombe: 10 Shots
- je 1.000 Bits: 50/50
- je 10.000 Bits: 100 %
- Ko-fi/Tipeee vorbereitet: je 10 € = 50/50, noch nicht produktiv angebunden

## Geprüfte Runtime

- Communication-Bus-Registrierung aktiv.
- 10-Sekunden-Auslosungsphase funktioniert.
- Ergebnis wird danach resolved.
- `shotsOpen` wird erst beim Ergebnis erhöht.
- `shot-done` funktioniert.
- Overlay-Statusleiste und Ergebnis-Overlay vorhanden.
- DB-Texte und DB-Config über vorhandene Helper eingebunden.

## Wichtig

Dashboard-Config-Dropdown darf bestehende Event-System-Einstellungen nie löschen oder ersetzen. Event-System und Shot-Alarm speichern getrennt.
