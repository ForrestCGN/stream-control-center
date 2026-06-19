# CURRENT CHAT HANDOFF – SHOT-ALARM / STEP 2C COMMAND

Stand: 2026-06-19

## Wichtigste Arbeitsregeln

- Nicht raten.
- Echte aktuelle Dateien prüfen.
- Fehlende Dateien exakt anfordern.
- Vor Umsetzung Plan schreiben und auf Forrests `go` warten.
- Keine Apply-/Patch-Scripte.
- Keine Funktionalität entfernen.
- Bei ZIP-Steps: ZIP einspielen/deployen → `stepdone.cmd` ausführen → danach testen.
- Produktive SQLite-DB niemals ersetzen/überschreiben.
- Bestehende Helper/EventBus/Text-/Config-/Dashboard-/DB-/Command-Patterns nutzen.

## Aktueller geprüfter Stand

Shot-Alarm ist bis **STEP 2C** im Backend/Command-System angebunden.

Backend Shot-Alarm:

- Modul: `shot_alarm`
- Version: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`

Command-System:

- Modul: `commands`
- Version: `0.2.4`
- Build: `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`

Dashboard-Fix-Stand:

- `SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost`

## Finale Dashboard-Einordnung

Pfad:

`Community → Event-System`

Tabs im Event-System:

- Übersicht
- Aktuelles Event
- Events
- Texte
- Config
- Statistik
- Overlay
- Shot-Alarm
- Test

Shot-Alarm ist ein eigener Tab innerhalb des Event-Systems.

Texte:

`Community → Event-System → Texte`

Dort im bestehenden Textbereich-Dropdown zusätzlich:

- `Shot-Alarm Chat`
- `Shot-Alarm Overlay`

Config:

`Community → Event-System → Config`

Dort gibt es einen sicheren Config-Bereich-Dropdown:

- `Event-System`
- `Shot-Alarm`

Wichtig:

- Event-System-Config bleibt vollständig.
- Shot-Alarm-Config ist zusätzlich getrennt auswählbar.
- Dropdown-Wechsel löscht nichts.
- Kein eigener linker Hauptnavigationspunkt `Events`.

## Neu in STEP 2C: `!shotdone`

Command:

- Trigger: `!shotdone`
- Alias: `!shotgetrunken`
- Modul: `shot_alarm`
- Action: `shot_done`
- Zielroute: `POST /api/shot-alarm/shot-done`
- ResponseMode: `module`
- Cooldown global: 1000 ms
- Cooldown User: 3000 ms

Berechtigungen:

- `engelcgn`
- `roxxyfoxxy`
- Broadcaster
- Mods

Technische Regel:

- Das Command-System antwortet bei `responseMode=module` nicht selbst nochmal im Chat.
- Die Chatmeldung kommt vom Shot-Alarm-Modul über `shotDone` oder `shotDoneEmpty`.

## Fachlogik Shot-Alarm

### Einzel-Support-Zähler

Zählt nur einzelne:

- Sub
- Resub
- einzelner GiftSub

Regeln:

- normal: 20 %
- jeder 5.: 50/50
- jeder 10.: 100 %

### Sub-Bomben

- 5er Bombe: 50/50
- je 10 Subs in einer Bombe: 1 sicherer Shot
- 100er Bombe: 10 sichere Shots

Sub-Bomben werden nicht zusätzlich als einzelne GiftSubs gezählt.

### Bits

- je volle 1.000 Bits im Restbereich: 50/50
- je volle 10.000 Bits: 1 sicherer Shot

Beispiele:

- 9.000 Bits → 9x 50/50
- 10.000 Bits → 1x 100 %
- 25.000 Bits → 2x 100 % + 5x 50/50

### Ko-fi / Tipeee

Noch nicht produktiv angebunden.

Geplante Regel:

- je volle 10 € Ko-fi: 50/50
- je volle 10 € Tipeee: 50/50

Ko-fi und Tipeee sind eigene Module und sollen später sauber über Payment-Bus-Events angebunden werden.

## Ablauf

- Event kommt über Twitch-Events / Communication Bus.
- Backend würfelt im Hintergrund.
- Ergebnis wird gebündelt.
- Keine Einzelwurf-Spam-Ausgabe.
- Auslosungsphase läuft standardmäßig 10 Sekunden.
- Ergebnis wird danach 10 Sekunden angezeigt.
- `shotsOpen` wird erst beim Ergebnis erhöht.
- Overlay zeigt oben eine kleine Karte und unten eine dezente Statusleiste.
- Sound wird zufällig aus Pool angefordert, aber nur einmal pro Ergebnis.
- `!shotdone` reduziert offene Shots und erhöht getrunkene Shots über die bestehende Shot-Alarm-Route.

## Erfolgreich getestet

- Statusroute `commands` zeigt Version `0.2.4` / Build `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`.
- `commands` ist enabled, initialized und schemaOk.
- Bus-Chat-Subscriber ist aktiv.
- `!shotdone` Dry-Run erkennt Trigger korrekt.
- `EngelCGN` wird über `allowedLogins` erlaubt.
- Zielpayload zeigt korrekt `POST /api/shot-alarm/shot-done`.
- `!shotdone` Execute liefert `ok=true`, `statusCode=200`, `dataOk=true`, `module=shot_alarm`.
- Testevent `10.000 Bits` erzeugt 1 sicheren Shot.
- Nach Auslosung: `shotsOpen=1`, `shotsDrunk=0`, `shotsAddedTotal=1`.
- Danach wurde `!shotdone` erfolgreich gegen `shot_alarm` ausgeführt.

Noch einmal live nachprüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status" |
  Select-Object shotsOpen,shotsDrunk,shotsAddedTotal,lastError
```

Erwartung nach `!shotdone` bei vorher 1 offenem Shot:

```text
shotsOpen = 0
shotsDrunk = 1
shotsAddedTotal = 1
lastError = leer
```

## Genutzte Helper / Systeme

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_chat_output.js`
- `backend/core/database.js`
- `backend/modules/communication_bus.js`
- `backend/modules/commands.js`

DB-Hinweis:

- Aktuell SQLite aktiv.
- `backend/core/database.js` ist zentrale DB-Schicht.
- MySQL/MariaDB-Dialekt ist vorbereitet, aber nicht produktiv aktiv.
- Keine direkte neue SQLite-Sonderlogik bauen, wenn vorhandene Helper genutzt werden können.

## Relevante Dateien

Backend:

- `backend/modules/shot_alarm.js`
- `backend/modules/commands.js`
- `config/shot_alarm.json`

Dashboard:

- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- `htdocs/dashboard/modules/shot_alarm.js`
- `htdocs/dashboard/modules/shot_alarm.css`

Overlay:

- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`

Doku:

- `docs/modules/shot_alarm.md`
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2C_COMMAND.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Wichtige Routen

Shot-Alarm:

- `GET /api/shot-alarm/status`
- `GET /api/shot-alarm/config`
- `POST /api/shot-alarm/config`
- `GET /api/shot-alarm/texts`
- `POST /api/shot-alarm/texts`
- `GET /api/shot-alarm/stats`
- `GET /api/shot-alarm/history`
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/manual-trigger`
- `POST /api/shot-alarm/shot-done`
- `POST /api/shot-alarm/resolve-pending`
- `POST /api/shot-alarm/reset-state`

Commands:

- `GET /api/commands/status`
- `GET /api/commands/list`
- `GET /api/commands/catalog`
- `GET/POST /api/commands/test`
- `GET/POST /api/commands/execute`
- `GET /api/commands/logs`
- `GET /api/commands/history`

## Nächster sinnvoller Schritt

Empfohlen: **STEP 2D – Rechte/Audit/Dashboard-Aktionen prüfen**

Vorher prüfen:

- `backend/modules/audit_log.js`
- `backend/modules/helpers/helper_dashboard_auth.js`
- `backend/modules/helpers/helper_dashboard_audit.js`
- vorhandene Dashboard-Aktionsmuster
- Shot-Alarm-Routen mit produktiver Wirkung:
  - `manual-trigger`
  - `shot-done`
  - `reset-state`
  - `resolve-pending`
  - Config-Speicherung

Ziel STEP 2D:

- Dashboard-Aktionen sauber absichern.
- Owner/Admin-Rechte prüfen.
- Audit-Logging für produktive Aktionen klären/ergänzen.
- Keine neue parallele Rechte-/Audit-Struktur bauen.

Weitere offene Steps:

1. Ko-fi/Tipeee Payment-Bus anbinden.
2. Soundpool im Dashboard mit Sound-/Media-System verbinden.
3. Statistik/History im Dashboard ausbauen.
4. Persistente Counter nach Neustart planen.
5. Overlay live in OBS feinjustieren.
6. `!shotdone` im echten Twitch-Chat testen.
