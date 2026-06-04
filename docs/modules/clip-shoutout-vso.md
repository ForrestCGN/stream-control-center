# Clip Shoutout VSO / Shoutout-System

Stand: 2026-06-04 / CAN-44.13.5

Diese Datei ist die Haupt-Modul-Doku für das Shoutout-System in `backend/modules/clip_shoutout.js`.

AutoShoutout ist ein Unterbereich dieses Moduls und wird zusätzlich in einer eigenen Fachdatei dokumentiert:

```text
docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md
```

## Zweck

Shoutout-/VSO-System mit Queue, Timeline, Statistik, Streamtag-Limit und offizieller Twitch-Shoutout-Anbindung.

Das Modul deckt aktuell mehrere Bereiche ab:

```text
- manueller Video-/Clip-Shoutout
- DisplayQueue für Video-/Clip-Ausspielung
- OfficialQueue für offiziellen Twitch-Shoutout
- AutoShoutout als konfigurierbarer Automatikbereich
- Streamtag-/Cooldown-Schutz
- Dashboard-Anbindung für Shoutout- und AutoShoutout-Funktionen
```

## Betroffene Backend-Dateien

```text
backend/modules/clip_shoutout.js
config/clip_system.json
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_messages.js
backend/modules/twitch.js
backend/modules/twitch_presence.js
backend/modules/stream_status.js
backend/core/database.js
```

## Dashboard-Dateien

```text
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
```

Weitere Shoutout-Dashboard-Dateien können je nach aktuellem Stand vorhanden sein und müssen vor Änderungen im echten Repo geprüft werden.

## Erkannte technische Merkmale

### `clip_shoutout.js`

- Aktuelle beobachtete Version nach CAN-44.13.3: `0.2.24`
- Alte Erst-Doku hatte Version `0.2.10`; dieser Wert ist veraltet.
- DB-Zugriff/DB-Bezug vorhanden.
- Config-Bezug vorhanden.
- Event/WebSocket/Broadcast-Bezug vorhanden.
- Status- und Queue-Routen vorhanden.
- Offizielle Twitch-Shoutout-Anbindung vorhanden.
- AutoShoutout nutzt dieselbe DisplayQueue/OfficialQueue-Basis.

## Abhängigkeiten

```text
../core/database
./commands
./communication_bus
./helpers/helper_config
./helpers/helper_core
./helpers/helper_texts
./helpers/helper_messages
./stream_status
./twitch
./twitch_presence
fs
path
```

## Wichtige API-Routen / Hinweise

Basis/API-Prefix je nach Implementierung prüfen. Bekannte Routen und Alt-Aliase:

```text
GET  /api/clip-shoutout/status
GET  /api/clip-shoutout/clips
GET  /api/clip-shoutout/run
POST /api/clip-shoutout/run
GET  /api/clip/shoutout
POST /api/clip/shoutout
GET  /api/clip-shoutout/settings
POST /api/clip-shoutout/settings
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/timeline
GET  /api/clip-shoutout/stats
GET  /api/clip-shoutout/stats/user
POST /api/clip-shoutout/display-queue/remove
POST /api/clip-shoutout/display-queue/retry
POST /api/clip-shoutout/queue/remove
POST /api/clip-shoutout/queue/retry
GET  /api/clip-shoutout/official/auth-status
```

AutoShoutout-Routen stehen vollständig in:

```text
docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md
```

## AutoShoutout-Unterbereich

AutoShoutout ist kein separates Modul, sondern Teil von `clip_shoutout.js`.

Aktueller Stand:

```text
CAN-44.13.3 / clip_shoutout v0.2.24
```

Wichtigste Funktionen:

```text
- konfigurierte Streamer erkennen
- nach 3 Nachrichten innerhalb 30 Minuten automatisch auslösen
- Begrüßung über helper_texts / Textvarianten
- Dry-Run-Test für /auto/test-chat
- gezielter Reset über /auto/clear-target
```

## Datenbank

Das Shoutout-System nutzt mehrere Tabellen. AutoShoutout-spezifische Tabellen sind in der Fachdatei dokumentiert.

Wichtige AutoShoutout-Tabellen:

```text
clip_shoutout_auto_settings
clip_shoutout_auto_streamers
clip_shoutout_auto_events
clip_shoutout_auto_message_activity
module_text_variants
```

Queue-/History-Tabellen des Hauptmoduls müssen vor Änderungen anhand der echten `clip_shoutout.js` geprüft werden.

## Aktueller Doku-Status

- Diese Datei wurde in CAN-44.13.5 aktualisiert, damit der AutoShoutout-Unterbereich im Modul-Kontext sichtbar ist.
- Fachdetails zu AutoShoutout liegen in `docs/modules/CLIP_SHOUTOUT_AUTOSHOUTOUT.md`.
- Vor Funktionsänderungen muss die echte Datei erneut vollständig aus GitHub/dev oder aus dem aktuellen Live-/ZIP-Stand geprüft werden.

## Offene Punkte / spätere Prüfung

```text
- Routen und Dashboard-Anbindung bei nächster echter Moduländerung erneut gegen Code prüfen.
- Manuelle !so-/!vso-Befehlsdoku noch mit aktuellem Command-Stand abgleichen.
- AutoShoutout-Doku nach Live-Test und Live-Gate-Entscheidung aktualisieren.
- Live-Status/onlyWhenLive nach Testphase wieder bewerten.
```

## Tests bei späteren Änderungen

```powershell
node -c backend\modules\clip_shoutout.js
```

Zusätzlich:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" | ConvertTo-Json -Depth 10
```

Dashboard-/Overlay-Flows nur produktiv testen, wenn das Modul wirklich betroffen ist. Test-Routen müssen standardmäßig Dry-Run bleiben.
