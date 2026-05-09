# STEP203.4 - Loyalty Auto Shadow Runner

Stand: 2026-05-09

## Ziel

Kontrollierter Auto Runner für Loyalty Shadow Mode.

Wichtig:

```text
Shadow Mode bleibt aktiv.
StreamElements bleibt aktiv.
Auto Runner ist standardmäßig aus.
Streamer.bot setzt weiterhin nur Stream Start/Stop.
```

## Geänderte Datei

```text
backend/modules/loyalty.js
```

## Version

```text
loyalty 0.1.3
```

## Neue Tabelle

```text
loyalty_runner_events
```

Die Tabelle wird per Safety-Net `CREATE TABLE IF NOT EXISTS` angelegt.

## Neue Settings

```text
autoRunner.enabledOnBoot = false
autoRunner.intervalSeconds = 60
autoRunner.runOnlyWhenLive = true
autoRunner.checkAutoLive = true
autoRunner.includeJoinedOnly = true
autoRunner.activeMinutes = 30
autoRunner.maxUsersPerRun = 250
```

## Neue Routen

```text
GET  /api/loyalty/runner/status
POST /api/loyalty/runner/start
GET  /api/loyalty/runner/start
POST /api/loyalty/runner/stop
GET  /api/loyalty/runner/stop
POST /api/loyalty/runner/run-once
GET  /api/loyalty/runner/run-once
GET  /api/loyalty/runner/events
```

## Verhalten

Der Runner nutzt intern den bereits getesteten Presence-Run.

Dadurch gelten weiterhin:

```text
nur wenn effective.live = true
Twitch Auto-Live wird geprüft
Streamer.bot-Fallback wird berücksichtigt
Twitch Presence User werden verwendet
Loyalty Watch Heartbeat vergibt Punkte
Intervall-Schutz verhindert doppelte Punkte
```

## Bewusst nicht enthalten

```text
keine Dashboard-UI
keine öffentlichen Commands
keine StreamElements-Abschaltung
kein Punkteimport
keine Rewards/Giveaways/Games
```
