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
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only/lokal-only.

## Aktueller Stand

```text
0.2.13 - OBS read-only Grundlage vorbereitet
```

## Zielregel

```text
Remote-Modboard ist UI-Wahrheit.
Dashboard-v2 lokal ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI bauen.
```

## Zugriff / Agent

```text
Mods: immer https://mods.forrestcgn.de/
Forrest/Engel zuhause: lokal /dashboard-v2
Forrest/Engel unterwegs: online https://mods.forrestcgn.de/
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber remote_agent.
```

## User/Rechte

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich spaeter.
Sperren/Entzug wirken online sofort.
```

## Aktuelle lokale Diagnose-Routen

```text
/api/remote/local-dashboard/runtime-profile
/api/remote/local-dashboard/agent-executor/status
/api/remote/local-dashboard/agent-executor/handshake
/api/remote/local-dashboard/obs/status
/api/remote/local-dashboard/obs/model
/api/remote-agent/status
```

## 0.2.13

OBS ist als erstes fachliches Modul read-only vorbereitet. Der lokale Adapter liest nur den bestehenden `remote_agent`-/Komponentenstatus. Keine OBS-Kommandos, keine Szenenwechsel, keine Mutes, keine Agent-Actions.

## Naechster Schritt

Nach lokalem Test und `stepdone` fuer 0.2.13:

```text
0.2.14 - OBS Inventar read-only vorbereiten
```

Ziel: Szenen/Quellen/Audio-Quellen read-only auslesbar machen, aber weiterhin keine Steuerung.
