# STEP462_SHOUTOUT_DIRECT_CHAT_COMMAND_BYPASS_FIX

## Ziel

Der reale Twitch-Chat-Command `!vso` soll sich genauso verhalten wie ein direkter POST auf `/api/clip-shoutout/run`.

## Problem aus STEP461

Die Display-Queue nahm zusätzliche Ziele per API korrekt an, aber der zweite echte Chat-Command kam nicht zuverlässig im Modul an oder wurde noch von der Command-Schicht/Cooldown-Schicht beeinflusst.

## Änderung

- `clip_shoutout.js` Runtime-Version: `0.2.5`
- Das Modul installiert beim Start einen direkten Wrapper um `commands.handleChatMessage`.
- Nur die konfigurierten Clip-Shoutout-Trigger werden abgefangen.
- Aktuell bleibt der Test-Command aus der Config erhalten, also `!vso`.
- Der direkte Wrapper ruft intern denselben Modulablauf wie `/api/clip-shoutout/run` auf.
- Display-Queue, 2-Minuten-Cooldown nach Finish, Event-Bus und Official-Queue bleiben erhalten.
- Permission-Level aus der Clip-Shoutout-Config wird weiterhin berücksichtigt.

## Warum

Damit `!vso @urlug` und direkt danach `!vso @bynexl` zuverlässig beide im Clip-Shoutout-Modul landen. Die Abstandregel liegt danach ausschließlich in der Display-Queue.

## Erwartung

```text
!vso @urlug
→ Shouti für @urlug aufgenommen.
→ urlug startet

!vso @bynexl
→ Shouti für @bynexl aufgenommen und wartet in der Warteschlange.
→ bynexl bleibt in der Display-Queue bis urlug fertig + 120 Sekunden
```

## Nicht geändert

- Sound-System
- Alert-System
- VIP-System
- twitch.js
- Commands-Datenbank-Schema
- bestehende Clip-Erstellung

## Test

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,command,directChatCommandBypassInstalled
```

Erwartet:

```text
clip_shoutout 0.2.5 True vso True
```
