# CAN44.27 AutoShoutout Bus Subscriber

## Ziel
AutoShoutout hängt nun direkt am Communication-Bus-Event `twitch.chat.message`, das zentral von `backend/modules/twitch_events.js` erzeugt wird.

## Geändert
- `backend/modules/clip_shoutout.js`
  - Version `0.2.43`
  - Bus-Capability `twitch.chat.message.consumer`
  - neue AutoShoutout-Bus-Subscription auf `channel=twitch.chat`, `action=message`
  - Normalisierung des Bus-Payloads zurück in das interne `PRIVMSG`-Format
  - AutoShoutout-Verarbeitung über `handleAutoShoutoutChatActivity(...)`
  - Direct-Wrapper bleibt als Fallback erhalten, überspringt AutoShoutout aber, wenn der Bus-Subscriber installiert ist
  - Status erweitert um `autoShoutout.state.busSubscriber`

## Wichtig
Die AutoShoutout-Konfiguration wird weiterhin aus der DB genutzt:
- Settings: `clip_shoutout_auto_settings`, Key `settings`
- Streamer: `clip_shoutout_auto_streamers`
- JSON `clip_system.json` bleibt nur Fallback/Seed, wenn DB-Settings noch nicht existieren.

## Tests
```powershell
node -c .\backend\modules\clip_shoutout.js
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status" | ConvertTo-Json -Depth 8
```

## StepDone
```cmd
.\stepdone.cmd "CAN44.27 AutoShoutout twitch.chat.message Bus Subscriber"
```
