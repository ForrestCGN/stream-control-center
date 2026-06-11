# Modul: commands

Stand: 2026-06-11  
Aktueller bestätigter Stand: STEP215 / LWG-5.7

## Zweck

`commands` ist das zentrale Chat-Command-System. Es verarbeitet Twitch-Chat-Events über den Communication Bus, prüft Command-Definitionen, Berechtigungen und Cooldowns und ruft anschließend die Zielmodule per HTTP auf.

## Bestätigte Runtime-Version

```text
moduleVersion = 0.2.2
moduleBuild   = LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
```

## Bestätigte Chat-Result-Brücke

Die in STEP214 gebaute Brücke ist live getestet:

```text
commands.js
→ Modul-Command ausführen
→ result.data.message lesen
→ wenn config.sendResultToChat=true
→ twitch_presence.sendChatMessage(...)
→ Send-Ergebnis als chatReply im command_execution_log speichern
```

## Bestätigter Test

```text
commands status        OK
execute sends chat     OK
log contains chatReply OK
```

## Wichtige Regeln

- Keine neue Twitch-Sendelogik in einzelnen Modulen bauen.
- Module liefern `message` zurück.
- `commands.js` entscheidet anhand der Command-Config, ob eine Chat-Antwort gesendet wird.
- Für Twitch-Chat wird `twitch_presence.sendChatMessage(...)` genutzt.
- Commands, die selbst senden, dürfen nicht zusätzlich zentral senden.

## Aktive Command-Freigabe

```text
punkte → enabled=true
points → Alias von punkte
config.sendResultToChat=true
config.resultChatTarget=twitch_presence
```

## Nicht automatisch freigegeben

```text
givepoints
setpoint
gamble
duell
raffle
roulette
```
