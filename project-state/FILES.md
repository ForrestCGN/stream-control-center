# Files / Target Paths

## Lokales Hauptverzeichnis

Das lokale Hauptverzeichnis des Projekts ist:

`D:\Streaming\stramAssets\`

Wichtig: Das Repository spiegelt dieses Hauptverzeichnis. Es wird **kein zusaetzlicher Ordner `StreamAssets` oder `stramAssets`** im Repo angelegt.

Beispiel:

```text
Repo:    backend/server.js
Lokal:   D:\Streaming\stramAssets\backend\server.js

Repo:    htdocs/dashboard/index.html
Lokal:   D:\Streaming\stramAssets\htdocs\dashboard\index.html

Repo:    config/streamdesk.json
Lokal:   D:\Streaming\stramAssets\config\streamdesk.json
```

## Wichtige Zielpfade

```text
backend/
backend/core/
backend/modules/
backend/modules/helpers/
config/
config/secrets/
htdocs/dashboard/
htdocs/dashboard/modules/
htdocs/overlays/
htdocs/assets/
data/sqlite/
docs/
project-state/
```

## Repo-Regel

Dateien im Repository sollen mit denselben relativen Zielpfaden liegen, damit ZIPs spaeter direkt nach `D:\Streaming\stramAssets\` entpackt werden koennen.

## Nicht ins Repo

```text
.env
.env.*
config/secrets/.env
config/secrets/.env.local
secrets/
tokens/
*.sqlite
*.sqlite3
*.db
*.db-shm
*.db-wal
backend/data/*.sqlite
data/sqlite/*.sqlite
data/**/*.sqlite
logs/
*_BACKUP*/
*.zip
*.7z
*.rar
*.bak*
*.old
```

## Ins Repo erlaubt

```text
.env.example
config/secrets/.env.example
config/*.json
config/*.example.json
backend/**/*.js
htdocs/dashboard/**/*
docs/**/*
project-state/**/*
```

Vor echten Config-Dateien immer pruefen, ob Secrets enthalten sind.

## Upload-Regel

Wenn ZIPs hochgeladen werden, werden sie vor Repo-Uebernahme bereinigt:

- keine SQLite-Datenbanken
- keine echten `.env`
- keine Token-/Secret-Dateien
- keine `.bak`-/`.old`-Altdateien ohne ausdrueckliche Freigabe
- keine generierten Archive
