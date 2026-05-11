# NEXT CHAT HANDOFF – stream-control-center STEP201

Stand: 2026-05-08

## Einstieg

Wir arbeiten am Projekt `stream-control-center`.

```text
GitHub-Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
```

## Wichtige Arbeitsregeln

```text
GitHub/dev und Projekt-Dokus sind Single Source of Truth.
Keine Annahmen über Dateien treffen.
Keine Funktionalität entfernen.
Keine Secrets, .env, SQLite, Tokens, Datenbanken, Backups oder temporären Dateien committen.
Keine PowerShell-Textpatches für JS/CSS/HTML/MD.
Nur vollständige echte Dateien ändern.
ZIPs mit echten Zielpfaden ab Repo-Root liefern.
Nach ZIP-Entpacken stepdone.cmd verwenden.
```

## Standard nach ZIP-Entpacken

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "passende commit beschreibung"
```

## Aktueller grüner STEP201-Stand

Folgende Module sind vollständig im Diagnose-Standard 6/6:

```text
alerts
soundalerts
tagebuch
todo
messages
message-rotator
sound
tts
challenge
clip
deathcounter
hug
obs
scene-control
discord
twitch-presence
overlay-chat
```

## Zuletzt erledigt

```text
STEP201.12d – Overlay-Chat Diagnose-Endpunkte
```

Produktiver Prefix:

```text
/api/overlay/chat
```

Grün:

```text
status
config
settings
routes
integration-check
reload
```

Reload ist nicht-destruktiv:

```text
kein Start
kein Stop
kein Reconnect
kein Clear
keine Chatnachricht
kein Emote-Reload
```

## Offener Punkt

```text
STEP201.12e – Twitch-Hauptmodul nur bewerten/planen
```

Nicht blind umbauen.

`twitch.js` wurde nicht angefasst, weil die Datei über GitHub/RAW nicht zuverlässig gelesen werden konnte.

## Problem mit GitHub/RAW

Versuchte Links:

```text
https://raw.githubusercontent.com/ForrestCGN/stream-control-center/dev/backend/modules/twitch.js
https://github.com/ForrestCGN/stream-control-center/blob/dev/backend/modules/twitch.js
https://raw.githubusercontent.com/ForrestCGN/stream-control-center/refs/heads/dev/backend/modules/twitch.js
```

Ergebnis in der Sitzung:

```text
UnexpectedStatusCode
```

## Sicherer Weg für twitch.js

Wenn Upload nicht geht, lokal exportieren:

```powershell
cd D:\Git\stream-control-center
Get-Content .\backend\modules\twitch.js -Raw | Set-Content D:\gpt\twitch_js.txt -Encoding UTF8
```

Oder nur Routen-Auszug:

```powershell
cd D:\Git\stream-control-center
Select-String -Path .\backend\modules\twitch.js -Pattern "registerGet|registerPost|/api/twitch|/twitch|module.exports" -Context 3,3 |
  Out-File D:\gpt\twitch_routes_extract.txt -Encoding UTF8
```

Für einen echten Patch an `twitch.js` weiterhin vollständige Datei verlangen.

## Empfehlung nächster Chat

1. Git-Stand prüfen.
2. Prüfen, ob alle heutigen STEP201-Commits in GitHub/dev sind.
3. Nicht direkt `twitch.js` patchen.
4. Erst `twitch.js` vollständig beschaffen.
5. Dann nur Planung/Bewertung:
   - welche produktiven Prefixe existieren
   - welche Routen kritisch sind
   - ob Diagnose-Endpunkte überhaupt sinnvoll sind
   - keine OAuth-/EventSub-/Helix-/Alert-/Clip-Logik verändern
