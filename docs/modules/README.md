# Module-Dokumentation – Loyalty/Commands/Games Stand STEP223

Aktueller bestätigter Stand:

```text
commands.js       0.2.2 / LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
loyalty.js        0.1.13
loyalty_games.js  0.2.4 / STEP_LWG_6_3_GAMBLE_TEXT_PERCENT_PARSER_CLEANUP
```

Bestätigte aktive Commands:

```text
!punkte / !points          Punkteanzeige
!givepoints @user amount   Admin-Punktevergabe durch Mod+
!setpoint @user balance    Admin-Set durch Streamer/Owner
!gamble amount             Gamble mit festem Einsatz
!gamble percent            Gamble mit Prozent-Einsatz, z. B. !gamble 10%
```

Bestätigt:

```text
Twitch Chat → EventBus → commands.js → Modulruntime → result.message → twitch_presence.sendChatMessage(...)
```

StreamElements darf aktuell noch parallel laufen. Für eine vollständige Umstellung müssen die alten SE-Commands später deaktiviert werden.
