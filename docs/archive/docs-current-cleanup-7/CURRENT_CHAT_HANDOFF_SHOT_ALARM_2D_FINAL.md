# CURRENT CHAT HANDOFF – SHOT-ALARM / STEP 2D FINAL

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

Shot-Alarm ist bis **STEP 2D Dashboard Audit Safety** umgesetzt und getestet.

Backend Shot-Alarm:

- Modul: `shot_alarm`
- Version: `0.2.2`
- Build: `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`

Command-System:

- Modul: `commands`
- Version: `0.2.4`
- Build: `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`

Dashboard-Fix-Stand:

- `SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost`
- `SHOT-ALARM-2D Dashboard Audit Safety`

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

Noch nicht produktiv an Shot-Alarm angebunden.

Geplante Regel:

- je volle 10 € Ko-fi: 50/50
- je volle 10 € Tipeee: 50/50

Wichtig:

- Ko-fi/Tipeee-Module existieren bereits, sind aktuell aber Alert-Provider.
- Sie publishen aktuell noch nicht auf den Communication Bus für `payment.kofi:received` / `payment.tipeee:received`.
- Deshalb lösen echte Ko-fi/Tipeee-Testevents aktuell voraussichtlich Alerts, aber noch keinen Shot-Alarm aus.

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

## STEP 2C – Chatbefehl `!shotdone`

Umgesetzt:

- Trigger: `!shotdone`
- Alias: `!shotgetrunken`
- Ziel: `POST /api/shot-alarm/shot-done`
- ResponseMode: `module`
- Erlaubt:
  - `engelcgn`
  - `roxxyfoxxy`
  - Broadcaster
  - Mods

Erfolgreich getestet:

- `/api/commands/status` zeigt Version `0.2.4`.
- `/api/commands/test?message=!shotdone&user=EngelCGN&role=vip` erkennt Command korrekt.
- `/api/commands/execute?message=!shotdone&user=EngelCGN&role=vip` führt gegen `shot_alarm` aus.
- Testevent `10.000 Bits` erzeugte 1 sicheren Shot.
- Danach wurde `!shotdone` erfolgreich ausgeführt.

## STEP 2D – Dashboard Audit Safety

Umgesetzt:

- `shot_alarm` Version `0.2.2`.
- Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- Neue Route `GET /api/shot-alarm/dashboard-audit`.
- Status erweitert um `safety` und `audit`.
- Schreibende Aktionen werden auditiert.
- Kritische Aktionen brauchen `confirmWrite:true`.
- Dashboard sendet `confirmWrite:true` bei kritischen Aktionen.
- Event-System-Shot-Tab zeigt Safety-/Audit-Infos.
- Hinweis im Dashboard korrigiert: `!shotdone ist aktiv`.

ConfirmWrite-pflichtig:

- `manual-trigger`
- `resolve-pending`
- `flush-pending`
- `reset-state`

Erfolgreich getestet:

- `/api/shot-alarm/status` zeigt `moduleVersion=0.2.2` und Build `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`.
- `/api/shot-alarm/dashboard-audit?limit=10` funktioniert.
- `POST /api/shot-alarm/resolve-pending` ohne `confirmWrite` liefert `confirm_write_required`.
- `POST /api/shot-alarm/resolve-pending` mit `confirmWrite:true` läuft erfolgreich.
- Audit enthält sowohl verweigerte als auch erlaubte Aktion.

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
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2D_FINAL.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Wichtige Routen

- `GET /api/shot-alarm/status`
- `GET /api/shot-alarm/config`
- `POST /api/shot-alarm/config`
- `GET /api/shot-alarm/texts`
- `POST /api/shot-alarm/texts`
- `GET /api/shot-alarm/stats`
- `GET /api/shot-alarm/history`
- `GET /api/shot-alarm/dashboard-audit`
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/manual-trigger`
- `POST /api/shot-alarm/shot-done`
- `POST /api/shot-alarm/resolve-pending`
- `POST /api/shot-alarm/flush-pending`
- `POST /api/shot-alarm/reset-state`

## Offener kleiner Cleanup-Punkt

Audit-Action-Namen vereinheitlichen:

- Aktuell beobachtet:
  - `shot_alarm.resolve_pending`
  - `shot_alarm.resolve-pending`
- Ziel:
  - `shot_alarm.resolve_pending`

Funktional nicht kritisch, aber für spätere Dashboard-Filter sauberer.

## Nächster sinnvoller Schritt

Empfohlen: **SHOT-ALARM-2E Ko-fi/Tipeee Payment-Bus Integration**

Vorher prüfen:

- `backend/modules/kofi.js`
- `backend/modules/tipeee.js`
- `backend/modules/communication_bus.js`
- vorhandene Alert-Payloads
- vorhandene Webhook-/Test-Routen

Ziel STEP 2E:

- Ko-fi/Tipeee-Testevents und echte Events als Payment-Bus-Events publishen.
- Shot-Alarm soll diese Events über seine vorhandenen Subscriptions verarbeiten.
- Keine direkte Sonderlogik im Shot-Alarm, wenn Publisher in Ko-fi/Tipeee sauber möglich sind.

Weitere offene Steps:

1. Audit-Action-Namen vereinheitlichen.
2. Soundpool im Dashboard mit Sound-/Media-System verbinden.
3. Statistik/History im Dashboard ausbauen.
4. Persistente Counter nach Neustart planen.
5. Overlay live in OBS feinjustieren.
6. Echten Twitch-Chat-Test mit `!shotdone` / `!shotgetrunken`.
