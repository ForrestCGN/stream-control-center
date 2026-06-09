# NEXT STEPS – nach LWG-4O.1

## Direkt nach Installation testen

1. Backend neu starten.
2. Statusroute pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/chat-bus/status" | ConvertTo-Json -Depth 10
```

Erwartung:

```text
ok=true
module=twitch_chat_bus_bridge
moduleBuild=STEP_LWG_4O_1
wrapped=true
enabled=true
config.onlyWhenSubscribed=true
```

## Naechster fachlicher Step

```text
LWG-4O.2 – Giveaway Claim Subscriber vorbereiten
```

Ziel:

- `loyalty_giveaways` subscribed auf `twitch.chat/message`.
- Nur bei aktivem Claim-Fenster wird geprueft, ob `userLogin` dem aktuellen Gewinner entspricht.
- Kein UI-Broadcast und kein Replay fuer normale Chatmessages.
- Treffer erzeugt spaeter ein wichtiges internes Event wie `giveaway.claim.detected` / `giveaway.claim.confirmed`.

## Weiterhin offen

- Prioritaetssystem fuer Bus spaeter planen.
- Command-System optional spaeter von Direktaufruf auf Bus-Subscriber migrieren.
- Chat-EventSub `channel.chat.message` vorerst nicht nutzen, solange IRC-Bot stabil ist.
