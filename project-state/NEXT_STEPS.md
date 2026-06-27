# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt nach `0.2.7 - Lokaler Dashboard-Ersatz geplant`:

```text
0.2.8 - Dashboard-v2 Shell vorbereitet
```

Ziel:

1. Echte lokale Dashboard-Dateien aus GitHub/dev lesen.
2. Klaeren, ob `htdocs/dashboard-v2` im Repo vollstaendig genug ist oder ob Forrest lokale Dateien aus `D:\Streaming\stramAssets\htdocs\dashboard-v2` bereitstellen muss.
3. `/dashboard-v2` als neue lokale Oberflaeche vorbereiten.
4. `/dashboard` erstmal stabil/alt lassen.
5. Keine Funktionen entfernen.
6. Keine Actions aktivieren.
7. Keine DB-Migration.
8. Keine neuen produktiven Writes.

Pflicht-Pruefdateien:

```text
backend/server.js
backend/core/paths.js
htdocs/dashboard-v2/index.html
htdocs/dashboard/index.html
```

Wenn vorhanden zusaetzlich:

```text
htdocs/dashboard-v2/assets/*
htdocs/dashboard/assets/*
docs/current/LOCAL_DASHBOARD_REPLACEMENT_PLAN_CURRENT.md
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
project-state/PARKED_TODOS.md
```

Nicht sofort bauen:

```text
Kontrollierter Online-Sync lokaler Aenderungen
```

Diese Idee bleibt geparkt. Erst lokale `/dashboard-v2` Shell und Migration sauber aufsetzen.
