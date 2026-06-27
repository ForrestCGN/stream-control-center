# CURRENT CHAT HANDOFF – SHOT-ALARM / STEP 2E FINAL

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
- Bestehende Helper/EventBus/Text-/Config-/Dashboard-/DB-Patterns nutzen.

## Aktueller geprüfter Stand

Shot-Alarm ist bis **STEP 2E** erfolgreich getestet.

Backend Shot-Alarm:

- Modul: `shot_alarm`
- Version: `0.2.3`
- Build: `STEP_SHOT_ALARM_2E_PAYMENT_HISTORY_ID_FIX`

Command-System:

- Modul: `commands`
- Version: `0.2.4`
- Build: `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`

Payment-Provider:

- Ko-fi: `backend/modules/kofi.js`, Version `0.1.1`
- Tipeee: `backend/modules/tipeee.js`, Version `0.1.1`

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

Produktiv angebunden über Payment-Bus seit STEP 2E.

Regel:

- je volle 10 € Ko-fi: 50/50
- je volle 10 € Tipeee: 50/50

Events:

- `payment.kofi.received`
- `payment.tipeee.received`

Ko-fi/Tipeee bleiben Alert-Provider und veröffentlichen zusätzlich Payment-Bus-Events. Shot-Alarm wird nicht direkt angesprochen.

## Ablauf

- Event kommt über Twitch-Events / Communication Bus / Payment-Bus.
- Backend würfelt im Hintergrund.
- Ergebnis wird gebündelt.
- Keine Einzelwurf-Spam-Ausgabe.
- Auslosungsphase läuft standardmäßig 10 Sekunden.
- Ergebnis wird danach 10 Sekunden angezeigt.
- `shotsOpen` wird erst beim Ergebnis erhöht.
- Overlay zeigt oben eine kleine Karte und unten eine dezente Statusleiste.
- Sound wird zufällig aus Pool angefordert, aber nur einmal pro Ergebnis.

## Command `!shotdone`

Seit STEP 2C aktiv.

- Trigger: `!shotdone`
- Alias: `!shotgetrunken`
- Ziel: `POST /api/shot-alarm/shot-done`
- Rechte: Engel/Roxxy/Broadcaster/Mods
- ResponseMode: `module`

Bei offenem Shot:

- `shotsOpen -1`
- `shotsDrunk +1`
- Chatmeldung aus Textpool

Bei keinem offenen Shot:

- Empty-Hinweis aus Textpool

## Safety / Audit

Seit STEP 2D aktiv.

Route:

- `GET /api/shot-alarm/dashboard-audit`

ConfirmWrite-pflichtig:

- `manual-trigger`
- `resolve-pending`
- `flush-pending`
- `reset-state`

Audit loggt erlaubte und verweigerte Aktionen.

Offener kleiner Cleanup-Punkt:

- Audit-Action-Namen vereinheitlichen. Ziel: `shot_alarm.resolve_pending`.

## History-ID-Fix

Seit STEP 2E Fix aktiv.

Behobener Fehler:

- `history_persist_failed: UNIQUE constraint failed: shot_alarm_history.id`

Fix:

- eigene eindeutige `historyId` / `storageId` für History-Einträge
- ursprüngliche Draw-ID bleibt fachlich im Payload erhalten

## Erfolgreich getestet

- Statusroute zeigt `shot_alarm` 0.2.3 mit Build `STEP_SHOT_ALARM_2E_PAYMENT_HISTORY_ID_FIX`.
- Ko-fi-Testevent liefert `paymentBus.ok=true` und `subscriberDeliveredCount=1`.
- Tipeee-Testevent liefert `paymentBus.ok=true` und `subscriberDeliveredCount=1`.
- Shot-Alarm verarbeitet Payment-Bus-Events.
- Bei 2x 10 € Testevents entstand bei 50/50 korrekt ein Treffer.
- `lastError` leer.
- `lastWarning` leer.
- `!shotdone` nach Payment-Shot erfolgreich:
  - vorher `shotsOpen=1`
  - danach `shotsOpen=0`
  - `shotsDrunk=1`
  - `shotsAddedTotal=1`

## Relevante Dateien

Backend:

- `backend/modules/shot_alarm.js`
- `backend/modules/commands.js`
- `backend/modules/kofi.js`
- `backend/modules/tipeee.js`
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
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2E_FINAL.md`
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
- `GET /api/shot-alarm/dashboard-audit`
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/manual-trigger`
- `POST /api/shot-alarm/shot-done`
- `POST /api/shot-alarm/resolve-pending`
- `POST /api/shot-alarm/flush-pending`
- `POST /api/shot-alarm/reset-state`

Ko-fi/Tipeee:

- `GET /api/alerts/kofi/status`
- `GET /api/alerts/kofi/test`
- `POST /api/alerts/kofi/webhook`
- `GET /api/alerts/tipeee/status`
- `GET /api/alerts/tipeee/test`
- `POST /api/alerts/tipeee/webhook`

Commands:

- `GET/POST /api/commands/test`
- `GET/POST /api/commands/execute`

## Nächster sinnvoller Schritt

Empfohlen: **SHOT-ALARM-2F Cleanup / Feinschliff**

Vorher prüfen:

- `backend/modules/shot_alarm.js`
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/shot_alarm.js`

Ziele:

1. Audit-Action-Namen vereinheitlichen.
2. Dashboard-Audit-Anzeige prüfen/ggf. sichtbarer machen.
3. Echte Ko-fi/Tipeee-Anbieter-Testevents über Webhook prüfen, falls eingerichtet.
4. Echte Twitch-Chat-Tests mit `!shotdone` und `!shotgetrunken`.
5. Overlay live in OBS feinjustieren.

Weitere offene Steps:

1. Soundpool im Dashboard mit Sound-/Media-System verbinden.
2. Statistik/History im Dashboard ausbauen.
3. Persistente Counter nach Neustart planen.
4. Overlay live in OBS feinjustieren.
