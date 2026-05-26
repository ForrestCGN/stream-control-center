# Current System Status

Stand: 2026-05-26

## Commands

Das Commands-Modul läuft mit:

```text
moduleVersion = 0.1.3
moduleBuild = media-playback-payload-bridge
```

Der Status-Endpunkt ist weiterhin leichtgewichtig. Media-Commands leiten Sound/Video-Ausführung jetzt backendseitig korrekt an `/api/sound/play` weiter und erzeugen den nötigen Payload aus der gespeicherten Command-Config.

Neue Diagnose:

```text
GET /api/commands/media-command-check?trigger=<trigger>
```

## Kanalpunkte

Kanalpunkte bleiben auf lokaler CRUD-/Dashboard-Basis. Media- und Action-Pattern soll weiterhin am Commands-System gespiegelt werden.
