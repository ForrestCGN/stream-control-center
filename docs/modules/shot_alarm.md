# Modul-Dokumentation: Shot-Alarm

Stand: 2026-06-19  
Aktueller Stand: **SHOT-ALARM-2D Dashboard Audit Safety**

## Zweck

Das Modul `shot_alarm` wertet Support-Events aus und entscheidet nach festen Regeln, ob Engel/Roxxy einen Shot trinken müssen. Ergebnisse werden gebündelt, nicht als Einzelwurf-Spam ausgegeben.

## Backend

Dateien:

- `backend/modules/shot_alarm.js`
- `config/shot_alarm.json`

Aktueller Backend-Stand:

- Modulversion: `0.2.2`
- Build: `STEP_SHOT_ALARM_2D_DASHBOARD_AUDIT_SAFETY`

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

Config-Bereiche:

- `Event-System`
- `Shot-Alarm`

Wichtig:

- Shot-Alarm ist kein eigener linker Hauptnavigationspunkt.
- Event-System-Config bleibt vollständig erhalten.
- Shot-Alarm-Config ist separat auswählbar.
- Dropdown-Wechsel darf keine Einstellungen löschen.

## Fachregeln

### Einzel-Support

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

Ko-fi/Tipeee-Module existieren bereits als Alert-Provider. Für Shot-Alarm fehlt noch die saubere Payment-Bus-Publisher-Anbindung.

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

## Safety / Audit

Neu seit STEP 2D:

- Route: `GET /api/shot-alarm/dashboard-audit`
- Status enthält `safety` und `audit`.
- Schreibende Aktionen werden auditiert.
- Kritische Aktionen brauchen `confirmWrite:true`.

ConfirmWrite-pflichtige Aktionen:

- `manual-trigger`
- `resolve-pending`
- `flush-pending`
- `reset-state`

Audit speichert im Speicher:

- erlaubte Aktionen
- verweigerte Aktionen
- Actor
- Source/Route
- Trust/IP
- Details

Der aktuelle Audit-Speicher ist ein lokaler Memory-Audit mit Retention-Hinweisen. Später kann eine Anbindung an ein zentrales Audit-System geprüft werden.

## Routen

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

## Erfolgreich getestete Punkte

- Backend registriert am Communication Bus.
- 100er Bombe = 10 Shots.
- 1–10 Resubs: 5er-Schwelle 50/50, 10er-Schwelle 100 %.
- Bits-Blocklogik korrekt.
- Aggregierter 25.000-Bits-Test mit `forceRoll=0` ergab 7 Shots.
- 10-Sekunden-Auslosung resolved korrekt.
- `shot-done` reduzierte offene Shots und erhöhte `shotsDrunk`.
- Dashboard-Screenshots bestätigten richtige Tab-/Dropdown-Einordnung.
- `!shotdone` funktioniert über das bestehende Command-System.
- STEP 2D Confirm-Schutz und Audit funktionieren.

## Offene Punkte

- Audit-Action-Namen vereinheitlichen: Ziel `shot_alarm.resolve_pending`.
- Ko-fi/Tipeee Payment-Bus anbinden.
- Soundpool im Dashboard an vorhandenes Sound-/Media-System anbinden.
- Statistik/History im Dashboard ausbauen.
- Persistente Counter nach Neustart planen/umsetzen.
- Overlay live in OBS feinjustieren.
- Echte Twitch-Chat-Tests mit `!shotdone` / `!shotgetrunken`.
