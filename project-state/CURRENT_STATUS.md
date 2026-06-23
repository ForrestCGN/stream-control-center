# CURRENT STATUS

Stand: DASHUI6C / dashboard-v2 Static Route  
Datum: 2026-06-23

## Aktueller Dashboard-v2-Stand

Dashboard-v2 befindet sich im Parallelaufbau.

Technische Basis:

```text
frontend/dashboard-v2/
React + Vite
```

Build-Ziel:

```text
htdocs/dashboard-v2/
```

Lokaler Zielaufruf:

```text
http://127.0.0.1:8080/dashboard-v2/
```

## Aktueller Backend-Stand

DASHUI6C ergänzt die statische Backend-Auslieferung für Dashboard-v2.

Neu:

- `paths.DASHBOARD_V2_DIR`
- `app.use("/dashboard-v2", express.static(...))`
- Index-Route für `/dashboard-v2` und `/dashboard-v2/`

## Nicht geändert

- `/dashboard` bleibt unverändert
- altes Dashboard bleibt produktiv
- kein React-Code geändert
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service

## Node-Neustart

Nötig.

Grund:

```text
backend/server.js
backend/core/paths.js
```

wurden geändert.

## Nächster sinnvoller Schritt

Nach Installation, Live-Deploy und Node-Neustart:

```text
http://127.0.0.1:8080/dashboard-v2/ testen
```

Danach:

```text
DASHUI7 / Erste read-only Statusseite mit echter API-Anbindung planen
```
