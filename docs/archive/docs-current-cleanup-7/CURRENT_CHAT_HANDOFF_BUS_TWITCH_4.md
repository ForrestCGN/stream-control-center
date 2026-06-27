# CURRENT CHAT HANDOFF – BUS-TWITCH.4

Stand: 2026-06-10

## Aktueller Stand

```text
BUS-TWITCH.4 – EventSub Chat Readiness abgeschlossen.
```

## Wichtig

`twitch_events` ist weiterhin vorbereitet, aber uebernimmt noch keine produktive EventSub-Ownership.

```text
currentOwner: twitch.js
desiredOwner: twitch_events
mode: prepared-disabled
```

## Neu in BUS-TWITCH.4

```text
/api/twitch/events/eventsub/chat-readiness
```

Die Route dokumentiert:

```text
- channel.chat.message v1
- condition broadcaster_user_id + user_id
- user:read:chat Scope-Anforderung
- App-Token Zusatzanforderungen
- aktuelle Code-Defaults reichen nicht automatisch
- Duplikat-Schutz ist vorbereitet, aber nicht aktiv
- keine Subscription-Erstellung aktiv
```

## Bisher getestet

```text
BUS-TWITCH.1: Status, Katalog, Bus-Registrierung, Heartbeat ok.
BUS-TWITCH.2: twitch_presence/IRC -> twitch_events -> Bus twitch.chat.message live ok.
BUS-TWITCH.3: EventSub Ownership Statusroute ok.
```

## Naechster Schritt

```text
BUS-TWITCH.5 – EventSub Chat Controlled Activation
```

Vorher live pruefen:

```text
- Token/Scopes fuer channel.chat.message
- broadcaster_user_id und Bot/user_id
- Duplikat-Schutz IRC + EventSub
- Subscription-Erstellung nur per explizitem Go
```
