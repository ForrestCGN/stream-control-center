# STEP398_VIP_SYSTEM_EVENT_BUS_AUDIT

## Zweck

Dieser Stand dokumentiert den echten aktuellen VIP-Systemzustand vor einer Event-Bus-Anbindung.

## Geprüfte Dateien

- `backend/modules/vip_sound_overlay.js`
- `htdocs/overlays/vip_sound_overlay_v2.html`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Aktuelle Architektur

Der VIP-Flow ist derzeit bereits an das Sound-System angebunden:

```text
/api/vip-sound/command oder /api/vip-sound/enqueue
→ vip_sound_overlay.js
→ /api/sound/play
→ Sound-System-Item mit visual.module = vip_sound_overlay
→ vip_sound_overlay_v2.html reagiert auf sound_system WebSocket-Events und /api/sound/status
```

## Wichtige Iststandsdetails

### Backend

`vip_sound_overlay.js` registriert produktiv:

```text
/api/vip-sound-overlay
/api/vip-sound
```

`/api/vip` ist bewusst nicht registriert.

Das Modul bietet bereits Routen für:

- routes/status/state/config/integration-check
- settings
- texts/event-keys/text CRUD
- roles
- events/recent/stats/daily-usage
- sounds/users/sounds/status/sounds/resolve/sounds/upload
- upload/status
- twitch-sync/status/run
- admin/summary/admin/test
- command
- enqueue
- client/audio-started/client/audio-ended/client/finished
- reset

### Sound-System-Anbindung

VIP-Sounds werden als Sound-System-Items erzeugt, u. a. mit:

```text
category = vip oder crew
priority = 60
target = both/stream/discord je nach Setting
outputTarget = device
queueIfBusy = true
parallelAllowed = false
source = vip_sound_overlay oder Streamer.bot-Quelle
meta.module = vip_sound_overlay
visual.module = vip_sound_overlay
visual.displayName/login/avatarUrl/title/text
```

### Overlay

`vip_sound_overlay_v2.html` nutzt aktuell:

```text
GET /api/sound/status alle 500ms
WebSocket op = sound_system
Filter: visual.module === vip_sound_overlay
Startgründe: started, device_play_started, item_started, item_starting, play_stream, next_started, interrupted_started, parallel_started, resumed
Stopgründe: auto_finished, finished, device_play_finished, device_play_stopped, manual_stop, manual_skip, stop_stream, skip_stream, stopped, reset
```

Das Overlay zeigt Name, Avatar, Titel und Text aus dem `visual`-Block des Sound-System-Items.

### Dashboard

`vip.js` verwendet:

```text
const API = '/api/vip-sound'
```

und lädt u. a.:

- `/admin/summary`
- `/settings`
- `/roles`
- `/texts`
- `/texts/event-keys`
- `/daily-usage/today`
- `/events/recent`
- `/stats`
- `/sounds/users`
- `/upload/status`
- `/twitch-sync/status`

## Was Event-Bus-Anbindung bedeutet

Nicht:

```text
VIP neu bauen
Sound-System entfernen
Overlay neu designen
Streamer.bot komplett ändern
```

Sondern:

```text
VIP-Overlay zusätzlich als Communication-Bus-Client registrieren
VIP-Modul sendet zusätzlich Bus-Events im Shadow-Modus
bestehende Sound-System-Events bleiben primäre Playback-Wahrheit
keine Funktionalität entfernen
```

## Vorgeschlagener Event-Kanal

```text
channel: vip.overlay
```

Aktionen:

```text
show
hide
update
finished
ack
```

Beispiel:

```json
{
  "channel": "vip.overlay",
  "action": "show",
  "payload": {
    "requestId": "vip_...",
    "soundRequestId": "snd_...",
    "displayName": "ForrestCGN",
    "login": "forrestcgn",
    "avatarUrl": "...",
    "title": "VIP-Sound",
    "text": "Danke, dass du da bist.",
    "type": "vip",
    "durationMs": 12000
  },
  "targetModule": "vip_sound_overlay",
  "targetType": "overlay"
}
```

## Empfehlung für den nächsten STEP

STEP399 sollte ein Shadow-Test sein:

1. Kein Produktionswechsel.
2. VIP-Overlay registriert sich zusätzlich als Bus-Client, ohne vorhandene Sound-System-Logik zu entfernen.
3. Backend sendet bei VIP-Sound-Start optional ein `vip.overlay/show` Shadow-Event.
4. Overlay ACK wird geprüft.
5. Sound-System bleibt entscheidend für Anzeige/Hide, bis der Shadow-Test stabil ist.
