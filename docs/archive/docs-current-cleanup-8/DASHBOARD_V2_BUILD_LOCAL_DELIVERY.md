# Dashboard v2 Build und lokale Auslieferung

Stand: 2026-06-23  
Status: DASHUI6B / Build-Helper Call-Fix

## Zweck

DASHUI6B korrigiert `build-dashboard-v2.cmd`.

Problem in DASHUI6:

In einer Windows-`.cmd` muss ein anderes `.cmd`-Script mit `call` gestartet werden.

Falsch:

```bat
npm.cmd -v
npm.cmd install
npm.cmd run build
```

Richtig:

```bat
call npm.cmd -v
call npm.cmd install
call npm.cmd run build
```

Ohne `call` gibt die Batch-Datei nach dem npm-Aufruf nicht sauber zur ursprünglichen Batch zurück. Dadurch endete der Helper beim Test direkt nach der npm-Version.

## Geändert

```text
build-dashboard-v2.cmd
```

## Ausführen

Im Repo-Root:

```powershell
cd D:\Git\stream-control-center
.\build-dashboard-v2.cmd
```

## Erwartung

Der Helper läuft jetzt weiter bis:

```text
[dashboard-v2] Installiere/aktualisiere Dependencies...
[dashboard-v2] Baue React/Vite Frontend...
[ok] Build erstellt:
     htdocs\dashboard-v2\index.html
```

## Lokaler Test

```text
http://127.0.0.1:8080/dashboard-v2/
```

Altes Dashboard gegenprüfen:

```text
http://127.0.0.1:8080/dashboard/
```

## Nicht geändert

- kein Backend-Code
- kein bestehendes Dashboard unter `htdocs/dashboard/`
- kein Agent-Code
- keine produktive SQLite
- keine Config
- keine OBS-Änderung
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service

## Node-/Backend-Neustart

Nicht nötig.
