# Next Steps

Stand: 2026-06-27

Naechster sinnvoller technischer Schritt nach `0.2.6 - Online-Modoberflaeche bereinigt`:

```text
0.2.7 - Lokaler Modboard-Start geplant
```

Ziel:

1. Echte Dateien aus GitHub/dev lesen.
2. Klaeren, wie dieselbe Remote-Modboard-App lokal auf dem Streaming-PC gestartet wird.
3. Runtime-Profil `online` vs. `local` sauber trennen.
4. Keine neue parallele Oberflaeche bauen.
5. Keine Actions aktivieren.
6. Keine DB-Migration.
7. Keine neuen produktiven Writes.

Moegliche Pruefdateien:

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/package.json
docs/current/LOCAL_STREAM_PC_ENV_START_PROFILE_CURRENT.md
docs/current/LOCAL_DASHBOARD_MODULE_SHELL_PLAN_CURRENT.md
project-state/PARKED_TODOS.md
```

Nicht sofort bauen:

```text
Kontrollierter Online-Sync lokaler Aenderungen
```

Diese Idee bleibt geparkt. Erst lokale Instanz/Startprofil sauber planen.
