# NEXT_STEPS

Stand: 2026-06-18

## Nächster empfohlener Schritt: SHOT-ALARM-2C Chatbefehl `!shotdone`

Ziel:

- Engel/Roxxy können im Chat melden, dass ein Shot getrunken wurde.
- Offene Shots werden reduziert.
- Getrunkene Shots werden erhöht.
- Chatmeldung kommt aus Shot-Alarm-Textvarianten.
- Overlay-Statusleiste wird aktualisiert.

Vor Umsetzung prüfen:

- `backend/modules/commands.js`
- `backend/modules/chat_output.js`
- Twitch-Chat-/Command-Verarbeitung
- vorhandene Rollen-/Berechtigungsprüfung
- Audit-/Logging-Muster
- vorhandene Texthelper für `shotDone` / `shotDoneEmpty`

Keine neue parallele Command-Struktur bauen.

## Weitere nächste Schritte

1. Ko-fi/Tipeee Payment-Bus-Events ergänzen und Shot-Alarm anbinden.
2. Shot-Alarm-Soundpool im Dashboard an vorhandenes Sound-/Media-System anbinden.
3. Rechte/Audit für Dashboard-Aktionen prüfen.
4. Statistik-/History-Ansicht im Dashboard erweitern.
5. Persistente Counter nach Neustart planen/umsetzen.
6. Overlay in OBS testen und optisch feinjustieren.
7. Shot-Alarm Config im Dashboard weiter vollständiger machen, ohne Event-System-Config zu beeinflussen.
