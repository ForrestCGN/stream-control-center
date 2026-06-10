# Modul: twitch_events

Stand: 2026-06-10  
Step: BUS-TWITCH.4 – EventSub Chat Readiness

## Zweck

`twitch_events` ist die zentrale Twitch-Event-Schicht des stream-control-center.

Das Modul soll Twitch-Ereignisse normalisieren und ueber den `communication_bus` abonnierbar machen.
Fachlogik bleibt in Fachmodulen wie Commands, Alerts, VIP30, Loyalty, Sound-System usw.

## Aktueller Stand

```text
moduleVersion: 0.1.3
moduleBuild: BUS_TWITCH_4_EVENTSUB_CHAT_READINESS
```

Bestaetigt aus den vorherigen Steps:

```text
BUS-TWITCH.1: Foundation, Status, Katalog, Bus-Registrierung, Heartbeat
BUS-TWITCH.2: twitch_presence/IRC -> twitch_events -> Bus twitch.chat.message live getestet
BUS-TWITCH.3: EventSub Ownership vorbereitet, aber nicht aktiviert
BUS-TWITCH.4: EventSub Chat Readiness dokumentiert und Statusroute ergaenzt
```

## Wichtige Architekturentscheidung

Zielarchitektur:

```text
Twitch EventSub channel.chat.message
-> twitch_events
-> communication_bus
-> Subscriber-Module
```

Aktueller produktiver Zwischenstand:

```text
twitch_presence / IRC
-> twitch_events.handleIrcEvent(...)
-> communication_bus
-> twitch.chat.message
```

`twitch.js` bleibt aktuell produktiver EventSub-Besitzer. `twitch_events` uebernimmt noch keine EventSub-WebSocket-Ownership und erstellt noch keine Subscriptions.

## Statusrouten

```text
GET /api/twitch/events/status
GET /api/twitch/events/catalog
GET /api/twitch/events/eventsub/ownership
GET /api/twitch/events/eventsub/chat-readiness
```

## Chat-Event-Policy

```text
event: twitch.chat.message
channel: twitch.chat
action: message
requireAck: false
replayable: false
ttlMs: 0
queued: false
priority: P2
payload: minimal
```

ACK/Replay sind im Event-Katalog technisch vorbereitet, aber fuer Twitch-Events standardmaessig aus.

## EventSub Chat Readiness

`channel.chat.message` ist als geplante Quelle fuer `twitch.chat.message` dokumentiert.

Geplante Condition:

```json
{
  "broadcaster_user_id": "<broadcaster/channel user id>",
  "user_id": "<chatting user/bot id>"
}
```

Autorisierung laut Twitch-Dokumentation:

```text
user access token: user:read:chat vom chatting user
app access token: zusaetzlich user:bot vom chatting user und channel:bot vom Broadcaster oder Moderatorstatus
```

Die aktuellen Code-Defaults in `twitch.js` reichen dafuer nicht automatisch:

```text
TWITCH_OAUTH_SCOPES default: kein user:read:chat
TWITCH_BOT_OAUTH_SCOPES default: chat:read chat:edit
```

Live-.env kann davon abweichen und muss vor Aktivierung geprueft werden.

## Duplikat-Schutz

Fuer spaetere parallele IRC/EventSub-Phase vorbereitet:

```text
cacheTtlMs: 30000
primaryKey: eventsub.message_id oder irc.tags.id
fallbackKey: source + channel + userId/login + message + 2s time bucket
```

Aktuell ist der Duplikat-Schutz nur dokumentiert/vorbereitet und nicht aktiv, weil EventSub-Chat noch nicht produktiv laeuft.

## Nicht geaendert

```text
backend/modules/twitch.js
backend/modules/twitch_presence.js
commands.js
bestehende EventSub-Flows
bestehende Alert-/VIP-/Loyalty-/Deathcounter-/Shoutout-Flows
SQLite / DB-Dateien
```

## Migrationsregel

```text
Keine alte Funktionalitaet entfernen.
Neue EventSub-Wege erst parallel aktivieren.
Erst wenn ein Modul erfolgreich ueber twitch_events abonniert, getestet und dokumentiert ist, darf alte Direktlogik entfernt oder deaktivierbar gemacht werden.
```

## Naechster Schritt

```text
BUS-TWITCH.5 – EventSub Chat Controlled Activation
```

Vorher im Live-System pruefen:

```text
1. Sind broadcaster_user_id und Bot/user_id sicher verfuegbar?
2. Hat der passende Token user:read:chat?
3. Soll der Bot-User oder Broadcaster-User als user_id verwendet werden?
4. Wie wird Subscription-Erstellung per Config hart geschuetzt?
5. Wie wird Duplikat-Schutz aktiv, wenn IRC und EventSub parallel laufen?
```
