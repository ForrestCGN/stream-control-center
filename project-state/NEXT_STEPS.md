# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Naechster sinnvoller Step

```text
BUS-TWITCH.4 – EventSub Chat Subscription in twitch_events planen/umsetzen
```

## Vor BUS-TWITCH.4 pruefen

```text
1. Welche Token/Scopes liegen im Live-System vor?
2. Kann channel.chat.message mit vorhandener Auth sauber erstellt werden?
3. Welche user_id soll fuer die Subscription verwendet werden: Bot/Heimleitung oder Broadcaster?
4. Duplikat-Schutz fuer IRC + EventSub parallel vorbereiten.
5. Erst dann EventSub WebSocket/Subscription-Erstellung in twitch_events aktivieren.
```

## Weiterhin offen

```text
- Keine alten EventSub-Direktwege entfernen, bevor Subscriber erfolgreich getestet sind.
- Commands spaeter als Subscriber fuer twitch.chat.message vorbereiten.
- Presence spaeter auf Presence/Chat-Senden/Kompatibilitaet reduzieren.
```
