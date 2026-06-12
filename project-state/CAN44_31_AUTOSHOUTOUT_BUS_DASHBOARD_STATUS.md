# CAN44.31 – AutoShoutout Bus + Dashboard Status

Stand: 2026-06-12

## Status

```text
Backend-Buspfad: bestätigt funktionsfähig
Dashboard-CAN44.31: vorbereitet, Live-Abnahme offen
Doku: aktualisiert
```

## Was wurde erreicht?

```text
AutoShoutout hängt erfolgreich am Communication/EventBus.
Twitch EventSub Chat wird über twitch_events.js normalisiert.
clip_shoutout.js empfängt twitch.chat/message und triggert AutoShoutouts.
Die fehlerhafte Dashboard-Anzeige wurde auf shoutout_v2.js zurückgeführt.
CAN44.31 Bridge/Patch wurde vorbereitet, damit die sichtbare ShoutoutV2-Aktivitätskarte kompakt und debugfähig wird.
```

## Aktuelle Dateien aus CAN44.31

```text
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
```

## Abhängige/prüfrelevante Dateien

```text
backend/modules/clip_shoutout.js
backend/modules/twitch_events.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
htdocs/dashboard/modules/shoutout_v2.js
htdocs/dashboard/index.html
```

## Live-Test-Befehle

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.autoShoutout.state.busSubscriber
$s.state.stats | Select-Object autoBusReceived,autoBusDelivered,autoBusErrors,autoTriggered,autoSkipped
```

## Dashboard-Prüfung

```javascript
window.AutoShoutoutV2ActivityPatch?.build
```

Erwartung:

```text
CAN44.31_AUTOSO_V2_ACTIVITY_MODAL_BRIDGE
```

## Offene Punkte

```text
CAN44.31 im Browser prüfen.
Info-Modal testen.
Echten !lurk AutoShoutout testen.
forrestcgn-Testeintrag entfernen/deaktivieren.
StepDone ausführen.
```
