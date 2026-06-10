# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Naechster sinnvoller Step

```text
BUS-TWITCH.5 – EventSub Chat Controlled Activation
```

## Vor BUS-TWITCH.5 pruefen

```text
1. Live-.env / Token-Scopes pruefen: user:read:chat muss fuer den chatting user vorhanden sein.
2. Broadcaster User-ID und Bot/User-ID sicher ermitteln.
3. Entscheiden, ob Bot/Heimleitung-User oder Broadcaster-User als user_id fuer channel.chat.message genutzt wird.
4. EventSub-WebSocket in twitch_events nur per hartem Config-/Go-Schalter aktivieren.
5. Subscription-Erstellung separat absichern: default false, kein automatisches Erstellen ohne ausdrueckliches Go.
6. Duplikat-Schutz aktivieren, solange IRC und EventSub parallel laufen.
7. Presence/IRC-Chat erst spaeter reduzieren, wenn EventSub-Chat produktiv getestet ist.
```

## Weiterhin offen

```text
- Keine alten EventSub-Direktwege entfernen, bevor Subscriber erfolgreich getestet sind.
- Commands spaeter als Subscriber fuer twitch.chat.message vorbereiten.
- Presence spaeter auf Presence/Chat-Senden/Kompatibilitaet reduzieren.
```
