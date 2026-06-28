# NEXT CHAT PROMPT - Remote-Modboard Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.

## Aktueller Stand

```text
0.2.10I - Modboard Online/Lokal Architekturregel dokumentiert
```

## Verbindliche Architekturregel

```text
Eine UI.
Zwei Zugangswege.
Ein Agent als zentraler Executor fuer Streaming-PC-Aktionen.
Synchronisierte User/Rechte zwischen Online und Lokal.
```

## Zugriff

```text
Mods:
immer https://mods.forrestcgn.de/

Forrest/Engel zuhause:
lokal am Streaming-PC/LAN ueber /dashboard-v2

Forrest/Engel unterwegs:
online ueber https://mods.forrestcgn.de/
```

## UI-Regel

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI mehr bauen.
```

## Agent-Regel

```text
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Stream-PC-Agent.
```

Online:

```text
Modboard online -> Webserver -> Agent -> Streaming-PC-Aktion
```

Lokal:

```text
Dashboard-v2 lokal -> lokaler Server/Adapter -> Agent -> Streaming-PC-Aktion
```

## User/Rechte-Sync

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich.
Sperren/Entzug von Rechten muessen online sofort wirken.
Der lokale Stand wird ueber den Agent nachgezogen, sobald verbunden.
```

## Naechster Schritt

Erst 0.2.10H lokal abschliessen:

```text
http://127.0.0.1:8080/api/remote/local-dashboard/adapter/status
http://127.0.0.1:8080/dashboard-v2/
```

Wenn die Remote-Modboard-Optik sichtbar passt, `stepdone.cmd`.

Danach sinnvoll planen:

```text
0.2.11 - Architekturgrundlage fuer Runtime-Profil/Agent-Executor/User-Rechte-Sync vorbereiten
```

Nicht wieder lokale UI nachbauen.
