# Modul: commands

Stand: 2026-06-11  
Aktueller bestätigter Stand: STEP216 / LWG-5.8

## Bestätigte Runtime-Basis

```text
moduleVersion = 0.2.2
moduleBuild   = LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
```

## Relevanz für STEP216

`commands.js` ist für den Live-Chat-Flow zuständig. STEP216 selbst testet Admin-Punkte bewusst direkt gegen die Loyalty-Runtime, damit keine unnötigen Chat-Nachrichten erzeugt werden.

## Wichtig

Die zentrale Chat-Send-Brücke aus STEP214 bleibt unverändert aktiv:

```text
result.message → twitch_presence.sendChatMessage(...)
```

## Freigabestatus

```text
punkte     enabled=true
points     Alias von punkte
givepoints weiterhin disabled
setpoint   weiterhin disabled
gamble     weiterhin disabled
```

Die Admin-Subcommands laufen über `!punkte give` und `!punkte set` und werden in `loyalty` selbst per Rollenprüfung geschützt.
