# Commands-Modul – Stand STEP223 / LWG-6.4

## Live-Basis

```text
backend/modules/commands.js
MODULE_VERSION = 0.2.2
MODULE_BUILD   = LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
```

## Bestätigte Chat-Ausgabe

Das Commands-Modul sendet Modulantworten über `twitch_presence`, wenn der Command mit `sendResultToChat=true` konfiguriert ist.

Bestätigt für:

```text
!punkte
!givepoints
!setpoint
!gamble
```

## Gamble-Command

Aktueller bestätigter Command-Stand:

```text
trigger         gamble
enabled         true
permissionLevel everyone
targetUrl       /api/loyalty/games/runtime/chat-command
responseMode    module
sendResultToChat true
resultChatTarget twitch_presence
moduleCommand   gamble
rawInputMode    true
```

## Bekannter Hinweis

Bei STEP222b wurde festgestellt, dass das aggregierte Command-Ergebnis das strukturierte Feld `bet` nicht oben als `result.bet` spiegelt. Der Chattext und die Balanceänderung bestätigen den korrekt berechneten Einsatz dennoch.

Späterer möglicher Cleanup:

```text
commands.js soll Moduldetails wie bet/outcome/winAmount/balance im Log/Result zusätzlich strukturiert übernehmen.
```
