# Local Dashboard Replacement Plan Current

Stand: `0.2.25`

Remote-Modboard bleibt die einzige UI-Wahrheit. Das lokale `dashboard-v2` ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.

## Erreicht

```text
0.2.22E: OBS lokal/online Status-Parity vorbereitet; OBS danach geparkt.
0.2.24: Media-System read-only Foundation ins Modboard gebracht.
0.2.25: Lokales Media-Inventar read-only vorbereitet.
```

## Lokal/Online

```text
Lokal liest Media-Dateien vom Stream-PC read-only.
Online wartet auf spaeteren Agent-WSS-Sync.
Eine UI, zwei Runtime-Profile.
```

## Grenzen

```text
Keine Uploads.
Keine Deletes.
Keine Edits.
Keine DB-Migration.
Keine Agent-Actions.
Keine absoluten Pfade.
```
