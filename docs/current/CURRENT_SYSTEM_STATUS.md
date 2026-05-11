# CURRENT_SYSTEM_STATUS - STEP250 Update

DeathCounter V2 unterstützt jetzt Zusatzspieler über den zentralen `!dcount` Command.

Neue Befehle:

```text
!dcount add @User
!dcount remove @User
!dcount clear
```

Details:

- `add` schreibt in `overlay.extraPlayerIds`.
- `remove` entfernt nur Zusatzspieler.
- `clear` entfernt alle Zusatzspieler.
- `reset` bleibt vollständiger Standard-Reset auf Default-Spieler und leere Extras.
- Die Grenze kommt aus `deathcounter_settings.maxExtraPlayers`, aktuell 2.
- Spielerauflösung nutzt die vorhandene State-/Twitch-Lookup-Logik.
- Die zentrale Command-API bleibt `/api/deathcounter/v2/command`.
- Streamer.bot muss weiterhin nur FetchURL mit `rawInput=%rawInput%` ausführen.

Keine Dashboard-, Overlay-, Streamer.bot-, DB- oder Count-Migration in diesem STEP.
