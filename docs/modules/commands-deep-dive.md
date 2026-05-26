# Commands-System Deep Dive

Stand: 2026-05-26

## Zweck

Zentrales Chat-Command-System für definierbare Chatcommands, Ausführung, Cooldowns, Permissions, Logs und Medien-Aktionen.

## Runtime-Kennung

```text
module = commands
moduleVersion = 0.1.3
moduleBuild = media-playback-payload-bridge
```

## Wichtige Änderung v0.1.3

Media-Commands (`sound_play`, `video_play`) bauen beim Ausführen jetzt einen echten Sound-System-Payload für `/api/sound/play`.

Vorher konnte ein Command zwar eine Media-ID speichern, aber beim Ausführen wurde diese Media-ID nicht zuverlässig an das Sound-System übergeben. Zusätzlich existierte in alten Dashboard-Hinweisen noch die Legacy-Route `/api/sound/play-media`, während das Sound-System produktiv `/api/sound/play` nutzt.

v0.1.3 korrigiert das im Backend:

- Media-Commands bekommen beim Execute `mediaId`, `mediaType`, `type`, `volume`, `target`, `outputTarget`, `source`, `requestedBy` und `meta` im Payload.
- Legacy-Ziel `/api/sound/play-media` wird beim Ausführen auf `/api/sound/play` umgeschrieben.
- `/api/commands/media-command-check?trigger=<name>` zeigt Routing und Payload-Vorschau.

## API-Routen

| Methode | Route |
|---|---|
| GET | `/api/commands/status` |
| GET | `/api/commands/list` |
| GET | `/api/commands/catalog` |
| POST | `/api/commands/upsert` |
| POST | `/api/commands/delete` |
| GET/POST | `/api/commands/test` |
| GET/POST | `/api/commands/execute` |
| GET | `/api/commands/media-command-check` |
| GET | `/api/commands/logs` |
| GET | `/api/commands/history` |

## Medien-Regel

Commands und Kanalpunkte sollen dasselbe Bedienprinzip nutzen:

```text
Name/Trigger oder Reward -> Aktionstyp -> Medienauswahl -> zentrale Ausführung
```

Medien werden nicht direkt im Command-System hochgeladen. Auswahl und Upload bleiben Aufgabe der zentralen Medienverwaltung. Die Ausführung läuft für Sound/Video über das Sound-System.

## Performance-Regel

`/api/commands/status` bleibt leichtgewichtig:

- keine Command-Liste
- kein vollständiger Katalog
- keine Recent Logs
- kein Schema-Touch bei Status

Die schweren Daten liegen auf getrennten Endpunkten.
