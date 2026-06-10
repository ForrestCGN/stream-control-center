# twitch_events

Stand: 2026-06-10

## Version

```text
0.1.4 – BUS_TWITCH_5_LIVE_TOKEN_ID_READINESS
```

## Aufgabe

Zentrale Twitch-Event-Schicht. Events werden normalisiert und über den Communication Bus abonnierbar gemacht.

## Aktueller Modus

```text
EventSub Ownership: vorbereitet, nicht aktiv
Chat Live Source: twitch_presence/IRC Parallel Bridge
Target Live Source: Twitch EventSub channel.chat.message über twitch_events
```

## Neue Route

```text
GET /api/twitch/events/eventsub/live-readiness
```

Prüft live, soweit verfügbar:

```text
- broadcaster_user_id
- chat_user_id
- user:read:chat im validierten User-Token
- aktueller EventSub-Status aus twitch.js
```

## Sicherheitsregel

`subscriptionCreationEnabled` bleibt false. Kein EventSub-Takeover ohne gesonderten STEP/Go.


## BUS-TWITCH.5b Hinweis

`BUS-TWITCH.5b` ändert nicht die EventSub-Ownership in `twitch_events`. Der Step ergänzt in `twitch.js` nur OAuth-Force-Verify und Scope-Diagnose, damit `user:read:chat` für `channel.chat.message` sauber in den User-Token übernommen werden kann.
