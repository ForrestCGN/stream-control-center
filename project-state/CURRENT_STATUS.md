# Current Status

## Stand

Aktueller Fokus: Shoutout-System / Clip-Shoutout / AutoShoutout im `stream-control-center`.

CAN-44.21.15 ist im Live-Test angekommen. Das Shoutout-Modul meldet:

```text
moduleVersion = 0.2.27
```

CAN-44.21.15 hat die Clip-Suche und Playback-Kandidatenprüfung verbessert, aber der Live-Test hat gezeigt: Die direkte Twitch-GQL-Playback-Auflösung ist bei bestimmten Clips/Kanälen nicht zuverlässig.

## Bestätigt

- Neue DB-Textvarianten sind aktiv und wurden im Chat genutzt.
- Duplicate-Meldungen kommen aus den neuen Textvarianten.
- Clip-Suche findet Clips bei `pretos1` und `together_not_alone`.
- `_overlay-clip_player.html` existiert im Repo und im Live-System.
- Display-Queue/Worker laufen grundsätzlich.
- Official Twitch Shoutouts wurden erfolgreich gesendet.

## Aktuelles Problem

Mehrere Display-Queue-Testeinträge sind fehlgeschlagen mit:

```text
clip_playback_failed_all_candidates
```

Das bedeutet: Clips wurden gefunden, aber alle direkten Playback-URL-Versuche scheiterten.

## Wichtige Festlegung

Für den nächsten Fix darf die Queue nicht umgangen werden.

Erhalten bleiben müssen:

- Display-Queue
- Worker
- Cooldown
- Start-Szene-Gate
- Official Twitch Queue
- AutoShoutout
- Dashboard-Queue
- Sound-/Bundle-System, sofern technisch möglich

## Nächster Fokus

CAN-44.21.16: Clip Player Overlay Fallback innerhalb der bestehenden Queue/Sound-Queue planen und dann nach `go` umsetzen.
