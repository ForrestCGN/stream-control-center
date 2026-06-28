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
0.2.11 - Runtime-Profil / Agent-Executor / User-Rechte-Sync Foundation vorbereitet
```

## Harte Architekturregel

```text
Eine UI.
Zwei Zugangswege.
Ein Agent als zentraler Executor fuer Streaming-PC-Aktionen.
Synchronisierte User/Rechte zwischen Online und Lokal.
```

```text
Mods:
immer https://mods.forrestcgn.de/

Forrest/Engel zuhause:
lokal am Streaming-PC/LAN ueber /dashboard-v2

Forrest/Engel unterwegs:
online ueber https://mods.forrestcgn.de/
```

## 0.2.11

0.2.11 erweitert nur den lokalen Adapter. Neue read-only Endpunkte:

```text
GET /api/remote/local-dashboard/runtime-profile
GET /api/remote/local-dashboard/architecture
```

Sie melden:
- Runtime `local`,
- UI-Quelle `remote-modboard`,
- Agent-Executor vorbereitet/geplant, aber nicht aktiv,
- User/Rechte-Sync vorbereitet/geplant, aber nicht aktiv,
- Writes/OBS/Sound/Overlay/Command/Shell/File/Process weiterhin blockiert.

## Naechster Schritt

Lokal testen:

```text
http://127.0.0.1:8080/api/remote/local-dashboard/runtime-profile
http://127.0.0.1:8080/api/remote/local-dashboard/adapter/status
http://127.0.0.1:8080/dashboard-v2/
```

Wenn sauber: `stepdone.cmd`.

Danach sinnvoll:
`0.2.12 - Agent-Executor-Schnittstelle diagnostisch/read-only vorbereiten`.
