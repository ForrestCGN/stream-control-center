# Files / Target Paths

Zielsystem lokal:

`D:\Streaming\stramAssets\`

## Wichtige Zielpfade

```text
backend/
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

Dateien im Repository sollen moeglichst mit denselben relativen Zielpfaden liegen, damit ZIPs spaeter direkt nach `D:\Streaming\stramAssets\` entpackt werden koennen.

## Nicht ins Repo

```text
.env
.env.*
config/secrets/.env
config/secrets/.env.local
secrets/
tokens/
*.sqlite
*.db
logs/
*_BACKUP*/
*.zip
*.7z
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

Vor echten Config-Dateien pruefen, ob Secrets enthalten sind.
