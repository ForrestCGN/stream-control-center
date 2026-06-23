# START HERE FOR NEW CHAT

Stand: RDAP7E_SERVER_WORKDIR_CLEANUP_DOCS  
Datum: 2026-06-23

## Zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP7E_SERVER_WORKDIR_CLEANUP_DOCS.md
```

## Projekt

Repository:

```text
ForrestCGN/stream-control-center
Branch: dev
Lokal: D:\Git\stream-control-center
Live Stream-PC: D:\Streaming\stramAssets
Remote-Modboard: https://mods.forrestcgn.de
Webserver: web.cgn.community
```

## Arbeitsweise

```text
Nicht raten.
Echte Dateien zuerst pruefen.
Vor Umsetzung Scope nennen.
Auf ausdrueckliches go warten.
Keine Funktionalitaet entfernen.
Vorhandene Helper/Module nutzen.
Keine Parallelstrukturen bauen.
Keine Secrets ins Repo oder Frontend.
Backend prueft Rechte; Frontend ist keine Sicherheitsentscheidung.
Ein Arbeitsort pro Schritt.
Maximal ein Befehlsblock pro Antwort.
Kein git add .
Bei ZIPs echte Repo-Pfade ab Repo-Root.
```

## Server-Ordnerregel

Ab RDAP7E gilt fuer Webserver-Schritte:

```text
Keine RDAP-Arbeitsordner direkt unter /root.
Keine Deploy-Clones direkt unter /root.
Keine RDAP-Backups direkt unter /root.
```

Standardpfade:

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Run-/Temp-Dateien:   /opt/stream-control-center/_runtime_tmp/
Backups:             /var/backups/stream-control-center/
```

## Bestaetigter Stand

```text
RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf c3stream_control erfolgreich.
RDAP7B Auth read-only Status-Endpunkte gebaut und auf GitHub/dev.
RDAP7C Live-Deploy/Test erfolgreich.
RDAP7C1 Server Workdir Cleanup erfolgreich.
RDAP7E dokumentiert diesen Stand.
```

Live-Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
GET https://mods.forrestcgn.de/api/remote/auth/me
GET https://mods.forrestcgn.de/api/remote/auth/session-status
```

Sicherheitsstatus:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
keine Cookies
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
```

## Naechster Schritt

```text
RDAP8_TWITCH_OAUTH_DRY_RUN_PLAN
```

Nur planen. Noch keinen echten Login aktivieren.
