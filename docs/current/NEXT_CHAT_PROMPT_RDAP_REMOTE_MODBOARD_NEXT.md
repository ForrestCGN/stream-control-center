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
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only/lokalen Dashboard-Steps.

## Aktueller Stand

```text
0.2.12 - Agent-Executor Diagnose/Handshake vorbereitet
```

## Verbindliche Architektur

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Dashboard-v2 lokal ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Mods nutzen immer https://mods.forrestcgn.de/.
Forrest/Engel nutzen zuhause lokal und unterwegs online.
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Agent.
User/Rechte duerfen lokal und online geaendert werden und muessen synchronisiert werden.
Sperren/Entzug wirken online sofort.
```

## 0.2.12 pruefen

```text
http://127.0.0.1:8080/api/remote/local-dashboard/agent-executor/status
http://127.0.0.1:8080/api/remote/local-dashboard/agent-executor/handshake
http://127.0.0.1:8080/api/remote-agent/status
http://127.0.0.1:8080/dashboard-v2/
```

0.2.12 ist diagnostic-only. Keine Agent-Kommandos, keine Writes, keine OBS-/Sound-/Overlay-/Command-Actions.

## Naechster sinnvoller Step

```text
0.2.13 - User/Rechte-Sync Statusmodell read-only vorbereiten
```
