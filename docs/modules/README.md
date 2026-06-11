# Module-Dokumentation

Stand: 2026-06-11

## Aktueller bestätigter Bereich

```text
STEP215 / LWG-5.7 – Live-Abschluss Points + Command-Chat-Brücke
```

## Relevante Module

```text
commands
loyalty
twitch_presence
loyalty_games
```

## Bestätigt

`!punkte / !points` läuft live über Node und sendet die Antwort zentral über `twitch_presence` in den Twitch-Chat.

## Verbindliche Regel

Keine neuen Parallel-Sender bauen. Für Twitch-Chat-Ausgaben wird das vorhandene `twitch_presence`-Modul genutzt.
