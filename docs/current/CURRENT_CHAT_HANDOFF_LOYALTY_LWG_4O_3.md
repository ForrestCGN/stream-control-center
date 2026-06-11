# Current Chat Handoff – Loyalty / Giveaway Claim – LWG-4O.3

## Aktueller Stand

LWG-4O.3 erweitert `loyalty_giveaways` um echte Chat-Claim-Fenster auf Basis des zentralen Bus-Events `twitch.chat.message`.

## Wichtig

- `twitch.chat.message` kommt zentral aus dem Eventbus-/Twitch-Event-Flow.
- `loyalty_giveaways` subscribed auf `channel=twitch.chat`, `action=message`.
- Ohne aktives Claim-Fenster wird sofort geskipped.
- Claim-Zustand wird aktuell im Winner-`metadata_json` abgelegt.
- Keine neue Tabelle, keine bestehende DB-Ersetzung, keine entfernte Funktionalität.

## Neue Endpunkte

```text
POST /api/loyalty/giveaways/:giveawayUid/winners/:winnerUid/claim/open
POST /api/loyalty/giveaways/:giveawayUid/winners/:winnerUid/claim/confirm
GET  /api/loyalty/giveaways/chat-claim/status
```

## Nächster sinnvoller Schritt

LWG-4O.4:

- Claim-Pflicht optional in Giveaway-Einstellungen/Dashboard sichtbar machen.
- Draw-Flow kann dann abhängig von `chatClaim.enabled` automatisch ein Claim-Fenster öffnen.
- Bei Wheel-Giveaways sollte die Wheel-Permission erst nach bestätigtem Claim aktiv werden.
- Timeout/No-Response/weiteren Gewinner ziehen sauber planen.
