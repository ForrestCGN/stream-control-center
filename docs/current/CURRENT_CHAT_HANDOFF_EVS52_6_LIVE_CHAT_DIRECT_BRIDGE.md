# EVS52.6 – Live-Chat Direct-Bridge für Satz-System

Stand: 2026-06-18

## Ziel

Echte Twitch-Chatnachrichten müssen beim Event-System nicht nur für Sound, sondern zusätzlich auch für das Satz-/Text-System ausgewertet werden.

## Änderung

- `stream_events` bleibt auf dem Communication-Bus `twitch.chat/message` subscribed.
- Zusätzlich wurde eine sichere Direct-Bridge auf `twitch_events.handleIrcEvent()` ergänzt.
- Die Direct-Bridge springt nur ein, wenn der Bus-Pfad die konkrete Chatnachricht nicht bereits an `stream_events` geliefert hat.
- Sound-Auswertung bleibt unverändert.
- Satz-/Text-Auswertung läuft danach parallel für echte IRC-/Twitch-Chatnachrichten.
- Live-Chat-Ausgaben für Worttreffer, Satzlösung und Duplicate laufen nur bei echtem Live-Chat und aktivem Runtime-Gate über `helper_chat_output`.

## Wichtig

- Dashboard-/Backend-Tests senden weiterhin nicht live in Twitch.
- Worttreffer können erkannt und gemeldet werden, auch wenn Wortpunkte deaktiviert sind.
- Punkte bleiben korrekt: Wortpunkte nur wenn aktiviert, Satzpunkte bei kompletter Lösung, Duplicate keine Punkte.

## Version

- Backend: `0.5.77`
- Build: `STEP_EVS52_6_LIVE_CHAT_DIRECT_BRIDGE`

## Test

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_6_LIVE_CHAT_DIRECT_BRIDGE_CHECK.ps1
```

Live-Test:

1. Laufendes Sound+Text-Event starten.
2. Ein echtes Wort aus einem offenen Satz im Twitch-Chat schreiben, z. B. `Test` wenn ein Satz dieses Wort enthält.
3. Prüfen:

```powershell
$d = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/text-runtime/live-debug"
$d.lastTextChatRuntime | ConvertTo-Json -Depth 8
$d.directChatBridge | ConvertTo-Json -Depth 8
$d.report.counts | ConvertTo-Json -Depth 4

Invoke-RestMethod "http://127.0.0.1:8080/api/chat-output/status" | ConvertTo-Json -Depth 8
```

Erwartung:

- `lastTextChatRuntime.source` ist `bus:twitch.chat.message` oder `direct:twitch_events.handleIrcEvent`.
- `busChat = true`.
- `textWordHitCount > 0` bei Teiltreffer.
- `chatOutputCount > 0`.
- `chat-output.stats.sent` steigt bei Live-Send.
