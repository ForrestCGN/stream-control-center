# Modul-Dokumentation: Shot-Alarm

Stand: 2026-06-19  
Aktueller Stand: **SHOT-ALARM-2C shotdone command**

## Zweck

Das Modul `shot_alarm` wertet Support-Events aus und entscheidet nach festen Regeln, ob Engel/Roxxy einen Shot trinken müssen. Ergebnisse werden gebündelt, nicht als Einzelwurf-Spam ausgegeben.

## Backend

Dateien:

- `backend/modules/shot_alarm.js`
- `config/shot_alarm.json`

Aktueller Backend-Stand:

- Modulversion: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`

Genutzte Systeme:

- Communication Bus
- DB-Config über `module_settings`
- DB-Textvarianten über `module_text_variants`
- `helper_texts.js`
- `helper_settings.js`
- `helper_chat_output.js`
- `backend/core/database.js`

## Command-Anbindung

Datei:

- `backend/modules/commands.js`

Aktueller Command-System-Stand:

- Version: `0.2.4`
- Build: `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`

Command:

- Trigger: `!shotdone`
- Alias: `!shotgetrunken`
- Ziel: `POST /api/shot-alarm/shot-done`
- Modul: `shot_alarm`
- Action: `shot_done`
- ResponseMode: `module`

Berechtigungen:

- `engelcgn`
- `roxxyfoxxy`
- Broadcaster
- Mods

Hinweis:

Das Command-System erzeugt bei `responseMode=module` keine eigene Chatantwort. Die Chatmeldung kommt aus dem Shot-Alarm-Modul über die Textkeys `shotDone` oder `shotDoneEmpty`.

## Dashboard-Einordnung

Pfad:

`Community → Event-System → Shot-Alarm`

Texte:

`Community → Event-System → Texte`

Textbereiche:

- `Shot-Alarm Chat`
- `Shot-Alarm Overlay`

Config:

`Community → Event-System → Config`

Config-Bereich-Dropdown:

- `Event-System`
- `Shot-Alarm`

Wichtig:

- Event-System-Config bleibt vollständig erhalten.
- Shot-Alarm-Config ist separat auswählbar.
- Dropdown-Wechsel darf keine Einstellungen löschen.

## Overlay

Datei:

- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`

Funktion:

- obere kleine Ergebnis-/Auslosungskarte
- untere dezente Statusleiste
- zeigt offene/getrunkene/gesamt Shots
- erhält Updates vom Backend/Bus

## Regeln

### Einzel-Support

Zählt:

- Sub
- Resub
- einzelner GiftSub

Regeln:

- normal: 20 %
- jeder 5.: 50/50
- jeder 10.: 100 %

### GiftBomb/Sub-Bombe

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

Vorbereitet, aber noch nicht produktiv angebunden.

Geplante Regel:

- je volle 10 € Ko-fi: 50/50
- je volle 10 € Tipeee: 50/50

Ko-fi/Tipeee sollen später sauber über Payment-Bus-Events angebunden werden.

## Ablauf

1. Event kommt über Twitch-Events / Communication Bus.
2. Shot-Alarm wertet Eventtyp und Betrag aus.
3. Backend startet eine gebündelte Auslosung.
4. Overlay zeigt Auslosungsphase.
5. Nach standardmäßig 10 Sekunden wird das Ergebnis resolved.
6. Erst beim Ergebnis wird `shotsOpen` erhöht.
7. Ergebnis wird 10 Sekunden angezeigt.
8. Sound wird nur einmal pro Ergebnis angefordert.
9. `!shotdone` oder `POST /api/shot-alarm/shot-done` reduziert offene Shots und erhöht getrunkene Shots.

## Runtime-Counter

- `shotsOpen` – aktuell offene Shots
- `shotsDrunk` – gemeldete/getrunkene Shots
- `shotsAddedTotal` – gesamt hinzugefügte Shots seit Laufzeitstart

Persistenz nach Neustart ist noch offen und muss separat geplant werden.

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

## Erfolgreich geprüfte Tests

### Command-System

- `/api/commands/status` zeigt Version `0.2.4` und Build `STEP_SHOT_ALARM_2C_SHOTDONE_COMMAND`.
- `!shotdone` Dry-Run erkennt Command korrekt.
- EngelCGN ist über `allowedLogins` erlaubt.
- Zielroute ist `POST /api/shot-alarm/shot-done`.
- Execute liefert `ok=true`, `statusCode=200`, `dataOk=true`, `module=shot_alarm`.

### Shot-Test

- `POST /api/shot-alarm/test` mit `10.000 Bits` und `forceRoll=0` erzeugt 1 sicheren Shot.
- Nach Auslosung standen `shotsOpen=1`, `shotsDrunk=0`, `shotsAddedTotal=1`.
- Danach wurde `!shotdone` erfolgreich ausgeführt.

Noch nachzuholen:

- finaler Countercheck direkt nach `!shotdone`.
- echter Twitch-Chat-Test mit Engel/Roxxy/Mod/nicht erlaubtem User.

## Offene Punkte

- Ko-fi/Tipeee Payment-Bus anbinden.
- Soundpool im Dashboard an vorhandenes Sound-/Media-System anbinden.
- Statistik/History im Dashboard ausbauen.
- Persistente Counter nach Neustart planen.
- Overlay im OBS-Livebild prüfen und feinjustieren.
- Dashboard-Aktionen mit Rechte-/Audit-Konzept absichern.
