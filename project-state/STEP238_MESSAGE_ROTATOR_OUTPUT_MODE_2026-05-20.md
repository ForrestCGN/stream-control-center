# STEP238 - Message-Rotator Output-Mode konfigurierbar

Stand: 2026-05-20

## Ziel

Der Message-Rotator soll nicht hart nur als normale Chatnachricht arbeiten, sondern pro Konfiguration steuerbar ausgeben koennen:

- normale Chatnachricht
- Twitch-Ankuendigung / Announcement

Der bestehende Standard bleibt `chat`, damit vorhandene Streamer.bot-Actions und der bisherige Livetest-Stand nicht brechen.

## Geaendert

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Backend

Neue globale Settings unter `messageOptions`:

```json
{
  "outputMode": "chat",
  "announcementColor": "primary"
}
```

Erlaubte globale Werte:

```text
outputMode:
- chat
- announcement

announcementColor:
- primary
- blue
- green
- orange
- purple
```

Neue optionale Item-Overrides:

```json
{
  "outputMode": "default",
  "announcementColor": "default"
}
```

Erlaubte Item-Werte:

```text
outputMode:
- default
- chat
- announcement

announcementColor:
- default
- primary
- blue
- green
- orange
- purple
```

`default` bedeutet: Item nutzt die globale Einstellung aus `messageOptions`.

## Runtime-Response

`/api/message-rotator/next` und `/api/message-rotator/manual` liefern bei sendbaren Nachrichten jetzt zusaetzlich:

```text
outputMode
announcementColor
isAnnouncement
streamerbot_send
streamerbot_message
streamerbot_output_mode
streamerbot_announcement_color
streamerbot_action
```

Beispiele:

```text
streamerbot_action = send_message
streamerbot_action = send_announcement
```

Wichtig: Das Backend sendet in diesem STEP keine Twitch-Ankuendigung selbst. Die Response liefert die Steuerdaten, damit Streamer.bot je nach `streamerbot_action` entweder normale Nachricht oder Announcement senden kann.

## Dashboard

Das Message-Rotator-Dashboard zeigt und speichert jetzt:

- globale Ausgabeart
- globale Announcement-Farbe
- Ausgabeart pro Item
- Announcement-Farbe pro Item
- Preview zeigt die effektive Ausgabeart

## Bewusst nicht geaendert

```text
backend/modules/chat_output.js
backend/modules/twitch.js
backend/core/database.js
backend/modules/helpers/**
config/**
data/**
app.sqlite
andere Dashboard-Module
```

## Kompatibilitaet

- Bestehender Default bleibt `chat`.
- Bestehende Items bekommen per DB-Seed/Config-Merge automatisch `outputMode: default` und `announcementColor: default`.
- JSON bleibt Fallback.
- DB-Settings bleiben in `message_rotator_settings`.
- DB-Texte bleiben in `module_text_variants` mit `module_name = message_rotator`.

## Tests

Syntaxchecks:

```powershell
node --check backend\modules\message_rotator.js
node --check htdocs\dashboard\modules\message_rotator.js
```

Live/API-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/settings" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/integration-check" | ConvertTo-Json -Depth 80
```

Schnelltest Announcement:

1. Im Dashboard `System -> Message-Rotator -> Settings` setzen:
   - `messageOptions.outputMode = announcement`
   - `messageOptions.announcementColor = purple`
2. Backend reloaden.
3. `next?commit=0` pruefen.

Erwartung:

```text
outputMode = announcement
announcementColor = purple
isAnnouncement = true
streamerbot_action = send_announcement
streamerbot_send = 0 bei commit=0
```

Danach wieder auf gewuenschte Produktivwerte setzen.

## Naechster Schritt

Streamer.bot-Action fuer den Rotator so anpassen, dass sie bei `streamerbot_action = send_announcement` die Twitch-Announcement-Funktion nutzt und bei `send_message` normal postet.
