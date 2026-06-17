# CURRENT STATUS – Event-System EVS44

Stand: 2026-06-17

## Bestätigt

### EVS43

RuntimeGate nutzt `twitch_events` Stream-State. Manual Override funktioniert. Chatantworten werden erkannt.

### EVS44

Stream-Offline wird jetzt als automatisches Warten behandelt, nicht mehr als klebender manueller Pausemodus.

Aktueller erwarteter Offline-Zustand:

```text
runtimeStatus = active
phase = stream_offline_waiting
label = Stream offline – Event wartet automatisch
```

## Aktiver Event

```text
eventUid: evs_event_mqi781rt_f19c50c6c409
Name: 1.Kopie von Kopie von 1 Jahr Twitch
Status: active
Spieltyp: Sound
```

## Nicht fertig

- Winner-Overlay ist noch nicht zufriedenstellend und soll neu/sauber weitergebaut werden.
- EVS44 Online-Rückkehr muss im echten Online-State bestätigt werden.
- Finale-Live-Auslösung mit echtem finished Event und echten Punkten steht noch aus.
