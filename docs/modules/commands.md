# Commands-Modul – Stand STEP217 / LWG-5.9

## Live-Basis

```text
backend/modules/commands.js
MODULE_VERSION = 0.2.2
MODULE_BUILD   = LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
```

## Relevante Commands

```text
!punkte / !points         everyone, aktiv
!givepoints @user amount  mod, aktiv ab STEP217
!setpoint @user balance   streamer/owner, aktiv ab STEP217
```

## Chat-Ausgabe

Modul-Commands liefern `result.data.message`. Das Commands-Modul sendet diese Antwort zentral über:

```text
twitch_presence.sendChatMessage(...)
```

Aktiviert wird die Chat-Ausgabe pro Command über `config.sendResultToChat = true`.

## STEP217-Konfiguration

`!givepoints`:

```json
{
  "moduleKey": "loyalty",
  "actionKey": "points_chat_command_runtime",
  "targetUrl": "/api/loyalty/runtime/points-command",
  "permissionLevel": "mod",
  "config": {
    "moduleCommand": "givepoints",
    "sendResultToChat": true,
    "resultChatTarget": "twitch_presence",
    "resultChatStep": "STEP217_LWG5_9"
  }
}
```

`!setpoint`:

```json
{
  "moduleKey": "loyalty",
  "actionKey": "points_chat_command_runtime",
  "targetUrl": "/api/loyalty/runtime/points-command",
  "permissionLevel": "streamer",
  "config": {
    "moduleCommand": "setpoint",
    "sendResultToChat": true,
    "resultChatTarget": "twitch_presence",
    "resultChatStep": "STEP217_LWG5_9"
  }
}
```
