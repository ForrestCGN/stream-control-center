# CURRENT CHAT HANDOFF – EVS52.8 Twitch-Chat Bus-Fallback

Stand: EVS52.8

## Ziel

Echte Twitch-Chatnachrichten sollen das Satz-/Text-System zuverlässig erreichen. EVS52.7 hat gezeigt, dass RuntimeGate und Live-Send aktiv sind, aber die `twitch_presence` Direct-Bridge nicht von echten Chatmessages erreicht wurde.

## Änderung

`stream_events` registriert zusätzlich zum spezifischen `twitch.chat/message` Subscriber einen Wildcard-Bus-Fallback. Dieser nimmt alle Bus-Events entgegen, filtert intern nur `twitch.chat.message` und verarbeitet sie nur, wenn sie nicht bereits vom primären Chat-Subscriber verarbeitet wurden.

## Wichtig

- Sound-Flow bleibt unverändert.
- Dashboard-Tests senden weiterhin nicht live.
- Live-Ausgabe läuft nur bei RuntimeGate aktiv und echter Bus-/Direct-Quelle.
- Keine Punkte-/Ranking-Logik geändert.

## Test

```powershell
powershell -ExecutionPolicy Bypass -File .\tools\tests\EVS52_8_TWITCH_CHAT_BUS_FALLBACK_CHECK.ps1
```

Danach im Twitch-Chat ein echtes Wort aus einem offenen Satz schreiben und das Script erneut ausführen.

Erwartung:

- `twitchChatBusFallback.delivered` steigt, falls der spezifische Subscriber nicht greift.
- `lastTextChatRuntime.source` ist `bus:twitch.chat.message` oder `bus:twitch.chat.message.fallback`.
- `report.counts.wordHits` und `chatOutputs` steigen bei Teiltreffer.
- `chat-output.stats.sent` steigt bei live gesendeter Chatmeldung.
