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
0.2.10H - Dashboard-v2 Remote-Asset-Pfade lokal repariert
```

## Zielregel

```text
Lokales Dashboard-v2 = optisch/strukturell exakte Remote-Modboard-Kopie.
```

0.2.10H repariert den 0.2.10G-Fehler, bei dem `/dashboard-v2` nur nacktes HTML zeigte, weil `/assets/...` lokal nicht auf Remote-Modboard-CSS/JS zeigte.

## Naechster Schritt

Lokal testen:

```text
http://127.0.0.1:8080/api/remote/local-dashboard/adapter/status
http://127.0.0.1:8080/dashboard-v2/
```

Wenn die Remote-Modboard-Optik sichtbar passt, `stepdone.cmd`. Danach erst `0.2.11 - Moduluebersicht read-only vorbereiten`.
