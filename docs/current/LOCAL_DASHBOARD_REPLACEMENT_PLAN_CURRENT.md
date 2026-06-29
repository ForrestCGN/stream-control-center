# Local Dashboard Replacement Plan Current

Stand: `0.2.26`

Remote-Modboard bleibt die einzige UI-Wahrheit. Das lokale `dashboard-v2` ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.

## Zielbild

```text
Eine UI.
Zwei Runtime-Profile.
Keine lokale UI-Fork.
Keine Online-Sonder-UI.
```

```text
runtimeMode=local:
  direkte lokale Datenquellen, lokale Media-/OBS-/Sound-Reads, Cloud optional.

runtimeMode=online:
  Webserver-Daten, zentrale Auth/Rechte/Audit, Stream-PC-Daten nur ueber Agent-Sync/Memory-Cache.
```

## Erreicht

```text
0.2.22E: OBS lokal/online Status-Parity vorbereitet; OBS danach geparkt.
0.2.24: Media-System read-only Foundation ins Modboard gebracht.
0.2.25: Lokales Media-Inventar read-only aktiv.
0.2.26: Runtime-/Modul-/Sync-/Permission-Standard dokumentiert.
```

## Architekturregeln

```text
- Fachliche Module statt Technikmodule.
- Sync/Agent/Cache sind Infrastruktur.
- Gleiche Funktionen bleiben im gleichen Modul.
- Jede Funktion bekommt von Anfang an Permission-/Rollenbezug.
- Backend bleibt Sicherheitsgrenze, nicht UI-Buttons.
```

## Lokal/Online

```text
Lokal liest Media-Dateien vom Stream-PC read-only.
Online wartet auf spaeteren Agent-WSS-Slow-Sync.
Eine UI, zwei Runtime-Profile.
```

## Installationsziel fuer andere Streamer

```text
Lokal muss ohne Cloud funktionieren.
Online-Modboard ist optionale Erweiterung fuer Mods/Teams.
Streamer-PC verbindet sich ausgehend zum Webserver.
Keine Portfreigaben am Heimrouter erforderlich.
```

## Grenzen

```text
Keine Uploads.
Keine Deletes.
Keine Edits.
Keine DB-Migration.
Keine Agent-Actions.
Keine absoluten Pfade.
Keine Secrets.
```
