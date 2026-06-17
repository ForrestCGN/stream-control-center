# CURRENT STATUS – Event-System EVS43

Stand: 2026-06-17

## Status

EventSound Runtime ist nach EVS43 in einem testbaren Zustand.

Bestätigt:

- Sound-Runtime spielt Schnipsel über Sound-System.
- Antwortfenster nutzt Event-Einstellung.
- Chatantwort wurde nach RuntimeGate-Fix erkannt.
- Punkte werden eventgebunden gespeichert.
- Recovery nach Node-Neustart funktioniert.
- Stream-Offline-Pause funktioniert im Grundfall.
- Dashboard zeigt nächsten Schnipsel und Countdown.
- Winner-Finale-Grundlage und Overlay sind vorbereitet.

## Wichtigster Fix EVS43

`stream_events` nutzt jetzt den zentralen `twitch_events` Stream-State statt roher Twitch-API als harte Wahrheit. Manual Override Online wird korrekt akzeptiert.

## Bestätigter Punktetest

```text
solved            : 1
soundScoreEntries : 1
ForrestCGN        : 10 Punkte
answer            : Full House
```

## Vorsicht

Manual Override nach Tests löschen oder TTL ablaufen lassen.
