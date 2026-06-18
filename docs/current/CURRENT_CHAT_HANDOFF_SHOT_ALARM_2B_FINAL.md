# CURRENT CHAT HANDOFF – SHOT-ALARM / STEP 2B FINAL

Stand: 2026-06-18

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

Shot-Alarm ist bis **STEP 2B.6** im Dashboard korrekt eingeordnet.

Backend:

- Modul: `shot_alarm`
- Version: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`

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

## Erfolgreich getestet

- Statusroute zeigt Backend 0.2.0/0.2.1 je nach Step korrekt geladen.
- Backend registriert am Communication Bus.
- 100er Bombe = 10 Shots.
- 1–10 Resubs: 5er-Schwelle 50/50, 10er-Schwelle 100 %.
- Bits-Blocklogik korrekt:
  - 999 → no_bits_rule
  - 1000 → 1x 50/50
  - 9000 → 9x 50/50
  - 10000 → 1x 100 %
  - 11000 → 1x 100 % + 1x 50/50
  - 25000 → 2x 100 % + 5x 50/50
- Aggregierter 25.000-Bits-Test mit `forceRoll=0` ergab 7 Shots.
- 10-Sekunden-Auslosung resolved korrekt.
- `shot-done` reduzierte offene Shots und erhöhte `shotsDrunk`.
- Dashboard-Screenshots bestätigt:
  - Tab `Shot-Alarm` sichtbar.
  - Config-Dropdown Event-System/Shot-Alarm sichtbar.
  - Event-System-Config bleibt erhalten.
  - Shot-Alarm-Config erscheint separat.

## Genutzte Helper / Systeme

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_chat_output.js`
- `backend/core/database.js`
- `backend/modules/communication_bus.js`

DB-Hinweis:

- Aktuell SQLite aktiv.
- `backend/core/database.js` ist zentrale DB-Schicht.
- MySQL/MariaDB-Dialekt ist vorbereitet, aber nicht produktiv aktiv.
- Keine direkte neue SQLite-Sonderlogik bauen, wenn vorhandene Helper genutzt werden können.

## Relevante Dateien

Backend:

- `backend/modules/shot_alarm.js`
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
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2B_FINAL.md`
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
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/manual-trigger`
- `POST /api/shot-alarm/shot-done`
- `POST /api/shot-alarm/resolve-pending`
- `POST /api/shot-alarm/reset-state`

## Nächster sinnvoller Schritt

Empfohlen: **STEP 2C – Chatbefehl `!shotdone` / Shot getrunken**

Vorher prüfen:

- `backend/modules/commands.js`
- `backend/modules/chat_output.js`
- vorhandene Command-Registry / Chat-Event-Verarbeitung
- Berechtigungen / Rollenprüfung
- Audit-/Logging-Muster
- Textvarianten für `shotDone` und `shotDoneEmpty`

Ziel STEP 2C:

- Engel/Roxxy können per Chat einen getrunkenen Shot melden.
- Vorschlag Command: `!shotdone`
- Berechtigungen: Engel, Roxxy, Broadcaster, optional Mods.
- Bei `shotsOpen > 0`: `shotsOpen -1`, `shotsDrunk +1`, Chatmeldung aus Textpool.
- Bei `shotsOpen = 0`: leerer Hinweis aus Textpool.
- Overlay/Statusbar aktualisieren.
- Keine neuen parallelen Command-Systeme bauen.

Weitere offene Steps:

1. Ko-fi/Tipeee Payment-Bus anbinden.
2. Soundpool im Dashboard mit Sound-/Media-System verbinden.
3. Statistik/History im Dashboard ausbauen.
4. Persistente Counter nach Neustart planen.
5. Overlay live in OBS feinjustieren.
