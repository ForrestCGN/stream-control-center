# CURRENT_CHAT_HANDOFF – CAN44.31 AutoShoutout Bus + Dashboard

Stand: 2026-06-12

## Kurzfassung

Der AutoShoutout wurde erfolgreich vom alten direkten Chat-Wrapper-Pfad auf den zentralen Communication/EventBus gehängt. Der funktionierende Stand ist CAN44.29 für den Backend-Buspfad. Danach wurde die AutoShoutout-Aktivitätsanzeige im Dashboard bearbeitet. Dabei stellte sich heraus, dass die sichtbare Ansicht nicht von `auto_shoutout.js`, sondern von `shoutout_v2.js` gerendert wird. CAN44.31 löst das per Bridge/Patch in `auto_shoutout.js`, das nach `shoutout_v2.js` geladen wird.

## Aktueller technischer Stand

```text
Repo: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Node: http://127.0.0.1:8080
```

## Bestätigter AutoShoutout-Buspfad

```text
Twitch EventSub Chat
  → twitch_events.js
  → Communication Bus twitch.chat/message
  → clip_shoutout.js Subscriber
  → AutoShoutout-Regeln
  → DisplayQueue / OfficialQueue
```

Bestätigter Status aus Live-Test:

```text
autoBusReceived  : 4
autoBusDelivered : 4
autoBusErrors    : 0
autoTriggered    : 2
autoSkipped      : 0
lastResultReason : queued
lastSourceModule : twitch_events_eventsub_chat
```

## Wichtigster Fix

Der AutoShoutout-Subscriber muss im Loyalty-Stil registriert sein:

```text
id: clip_shoutout:twitch.chat:message:auto_shoutout
channel: twitch.chat
action: message
capability: twitch.chat.message
```

Nicht wieder verwenden:

```text
twitch.chat.message.consumer
```

## Dashboard-Debug-Erkenntnis

Die sichtbare Karte „Streamer-Verwaltung“ und „Letzte AutoShoutout-Aktivität“ kommt aus:

```text
htdocs/dashboard/modules/shoutout_v2.js
```

Nicht aus:

```text
htdocs/dashboard/modules/auto_shoutout.js
```

Beweis aus Live-System:

```powershell
Get-ChildItem "D:\Streaming\stramAssets\htdocs" -Recurse -Include *.js,*.html,*.css |
  Select-String -Pattern "Streamer-Verwaltung","Letzte AutoShoutout-Aktivität","AutoShoutout-Aktivität" |
  Select-Object Path,LineNumber,Line
```

Treffer:

```text
D:\Streaming\stramAssets\htdocs\dashboard\modules\shoutout_v2.js
```

## CAN44.31

CAN44.31 erstellt eine Bridge/Patch-Logik in:

```text
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
```

Grund: `index.html` lädt zuerst `shoutout_v2.js`, danach `auto_shoutout.js`. Dadurch kann `auto_shoutout.js` die ShoutoutV2-Aktivitätskarte nachträglich ersetzen, ohne `index.html` und ohne großen ShoutoutV2-Refactor.

Browser-Prüfung:

```javascript
window.AutoShoutoutV2ActivityPatch?.build
// CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE
```

## Zielanzeige im Dashboard

Kompakte Liste:

```text
Zeit | Streamer | Status | Info
```

Info-Modal:

```text
Streamer
Auslöser
Status
Kurzstatus
Grund
Zeit
DisplayQueue
Quelle
Chat-Nachricht
Stream-Day
Rohdaten anzeigen
```

## Noch zu prüfen

```text
CAN44.31 live einspielen
Browser hart neu laden
window.AutoShoutoutV2ActivityPatch?.build prüfen
Community → Shoutout → AutoShoutout öffnen
Aktivitätsliste prüfen
Info-Button testen
Echten Auto-Streamer mit !lurk testen
forrestcgn aus AutoShoutout-Liste entfernen, falls nur Testeintrag
StepDone ausführen
```

StepDone:

```cmd
.\stepdone.cmd "CAN44.31 AutoShoutout V2 Activity Bridge"
```

## Projektregeln

```text
Keine Funktionalität entfernen.
Echte Dateien/GitHub-dev/Live-Dateien als Single Source of Truth verwenden.
SQLite niemals ersetzen.
Bei Dashboard-Änderungen zuerst prüfen, welche Datei sichtbar rendert.
ZIPs mit echten Zielpfaden liefern.
```
