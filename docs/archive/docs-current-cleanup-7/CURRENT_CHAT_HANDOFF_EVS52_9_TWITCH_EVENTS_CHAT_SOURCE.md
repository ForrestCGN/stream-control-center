# CURRENT CHAT HANDOFF – EVS52.9 Twitch-Events Chatquelle

Stand: 2026-06-18

## Ergebnis dieses Steps

EVS52.9 raeumt die mehrfachen Chatpfade auf und setzt fuer Sound+Satz wieder auf eine zentrale Twitch-Chatquelle.

## Neuer Zielpfad

```text
twitch_presence IRC PRIVMSG
→ twitch_events.handleIrcEvent()
→ twitch_events publishTwitchEvent("twitch.chat.message")
→ communication_bus channel=twitch.chat action=message
→ stream_events Subscriber stream_events:twitch.chat.message
→ processParallelChatMessage()
→ processSoundChatMessage() + processTextChatMessage()
```

## Geaenderte Module

```text
stream_events 0.5.80 / STEP_EVS52_9_TWITCH_EVENTS_CHAT_SUBSCRIBER
twitch_presence 0.1.6 / EVS52_9_TWITCH_EVENTS_CHAT_SOURCE
```

## Aufgeraeumt

- EVS52.6 Direct-Bridge-Patch in `stream_events` entfernt.
- EVS52.7 Direct-Call aus `twitch_presence` nach `stream_events` entfernt.
- EVS52.8 Wildcard-Bus-Fallback in `stream_events` entfernt.

## Nicht geaendert

- Keine DB-Aenderung.
- Keine Punktelogik.
- Keine Sound-Rundenlogik.
- Keine Satz-/Text-Punktelogik.
- Keine Dashboard-Struktur.

## Nach Einspielen

```powershell
.\stepdone.cmd "EVS52.9 Twitch-Events Chatquelle fuer Sound und Satz"
```

Danach Backend neu starten und testen.

## Pflichtchecks

```powershell
node -c .\backend\modules\stream_events.js
node -c .\backend\modules\twitch_events.js
node -c .\backend\modules\twitch_presence.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
$s.runtime.chatSource | Format-List

powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_5_TEXT_LIVE_FLOW_CHECK.ps1
```

## Live-Test

1. Sound+Text-Event starten.
2. Teilwort aus offenem Satz in Twitch-Chat schreiben.
3. Kompletter Satz in Twitch-Chat schreiben.
4. Duplicate schreiben.
5. Soundantwort schreiben.
6. Ranking/User-Historie pruefen.

## Erwartung

- `runtime.chatSource.subscribed=True`.
- Bei echter Chatmessage steigt `runtime.chatSource.delivered`.
- Sound-Spiel funktioniert weiter.
- Satz-Spiel erkennt Teiltreffer und Satzloesung.
- Sound + Satz landen gemeinsam im Ranking.
