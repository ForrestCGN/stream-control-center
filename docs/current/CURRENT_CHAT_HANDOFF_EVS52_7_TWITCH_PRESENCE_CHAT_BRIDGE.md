# EVS52.7 – Twitch-Presence-Chat an Satz-System angebunden

Stand: 2026-06-18

## Ziel

Echte Twitch-Chatnachrichten, die bereits über `twitch_presence` in das Sound-Spiel gelangen, werden zusätzlich an die Satz-/Text-Runtime von `stream_events` gegeben.

## Änderung

- `backend/modules/stream_events.js`
  - Version 0.5.78 / `STEP_EVS52_7_TWITCH_PRESENCE_CHAT_BRIDGE`.
  - Exportiert `handleTwitchPresenceIrcChat()` als direkte sichere Chat-Brücke für `twitch_presence`.
  - Verarbeitet Quelle `direct:twitch_presence.emitTwitchChatEvent` als echte Live-Chatquelle.
  - Nutzt weiterhin `processParallelChatMessage()` für Sound + Text parallel.
  - Verhindert doppelte Verarbeitung, wenn der Bus-Pfad bereits verarbeitet hat.

- `backend/modules/twitch_presence.js`
  - Version 0.1.5 / `EVS52_7_STREAM_EVENTS_CHAT_BRIDGE`.
  - Ruft nach dem bestehenden `twitch_events.handleIrcEvent()` zusätzlich `stream_events.handleTwitchPresenceIrcChat()` auf.
  - Bestehender Sound-/Bus-/Command-Flow bleibt erhalten.

## Wichtig

- Sound-Spiel bleibt unverändert.
- Dashboard-/Backend-Tests senden weiterhin nicht live in Twitch.
- Live-Chat-Ausgaben laufen nur bei aktivem RuntimeGate.
- Punkte-/Ranking-Logik bleibt unverändert.

## Test

```powershell
node -c .\backend\modules\stream_events.js
node -c .\backend\modules\twitch_presence.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_7_TWITCH_PRESENCE_CHAT_BRIDGE_CHECK.ps1
```

Danach echten Twitch-Chat testen: ein Wort aus einem offenen Satz schreiben. Erneut Diagnose-Script ausführen.

Erwartung:

- `directChatBridge.delivered` steigt.
- `lastTextChatRuntime.source = direct:twitch_presence.emitTwitchChatEvent` oder Bus-Quelle.
- `textWordHitCount > 0` bei Teiltreffer.
- `chatOutputCount > 0`.
- `chat-output stats.sent` steigt, wenn eine Chatmeldung live gesendet wurde.
