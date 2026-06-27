# CAN-43.7 Todo Diagnostics Review

Stand: 2026-06-03 13:15

## Ziel

Das Modul `todo` wurde als sechstes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step.

## Ergebnis

`todo` ist sauber.

- Repo/Live-Abgleich sauber.
- `todo` live aktiv/geladen.
- `GET /api/todo/status` vorhanden.
- `diagnostics`-Block vorhanden.
- `GET /api/todo/routes` vorhanden.
- `GET /api/todo/integration-check` sauber.
- Registry-Eintrag vorhanden.
- Coverage sauber.
- 4/4 Todo-Channels konfiguriert.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: 976909e5 CAN-43.6 Tagebuch diagnostics review
Git-Status: sauber
```

```text
diagnostics registry coverage:
ok=True
registryEntries=14
loadedModules=52
coveredLoadedModules=14
missingLoadedModules=0
registryOnlyEntries=0
```

## Statusroute

Geprüft:

```powershell
$td = Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status"
```

Ergebnis:

```text
ok=True
module=todo
version=2
schemaVersion=1
schemaReady=True
schemaError=
databasePath=D:\Streaming\stramAssets\data\sqlite\app.sqlite
discordChannelsPath=D:\Streaming\stramAssets\config\discord_channels.json
messagesPath=D:\Streaming\stramAssets\config\messages\todo.json
loadedAt=2026-06-03T10:43:56.410Z
lastLoadError=
lastUserinfoError=
```

## Diagnostics

```text
ok=True
health=ok
module=todo
version=0.1.0
schemaVersion=1
schemaReady=True
lastError=
```

Counts:

```text
targets=4
channelsConfigured=4
channelsTotal=4
missingChannels=0
userStats=10
dailyStats=27
settings=5
textVariants=13
legacyTexts=13
```

Database:

```text
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=1
expectedSchemaVersion=1
error=
```

## Channels / Targets

Live bestätigt:

```text
channelsConfigured=4
channelsTotal=4
missingChannels=0
```

Targets:

```text
forrest
engel
roxxy
gecko
```

## Routen

Geprüft:

```powershell
$tr = Invoke-RestMethod "http://127.0.0.1:8080/api/todo/routes"
```

Ergebnis:

```text
ok=True
module=todo
version=1
standardPrefix=/api/todo
count=19
```

Kategorien:

```text
admin
config
diagnostics
entry
legacy
settings
stats
status
```

## Integration-Check

Geprüft:

```powershell
$ti = Invoke-RestMethod "http://127.0.0.1:8080/api/todo/integration-check"
```

Ergebnis:

```text
ok=True
module=todo
version=1
schemaVersion=1
healthy=True
warnings leer
errors leer
```

Config:

```text
ok=True
discordChannelsPath=D:\Streaming\stramAssets\config\discord_channels.json
messagesPath=D:\Streaming\stramAssets\config\messages\todo.json
source=database_with_json_fallback
error=
```

Database:

```text
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=1
expectedSchemaVersion=1
error=
```

Channels:

```text
ok=True
missing={}
```

Targets:

```text
ok=True
count=4
```

Files:

```text
discordChannels ok=True
messages ok=True
```

## Nicht ausgelöst

Für diesen Review wurden ausschließlich read-only Endpunkte genutzt.

Nicht ausgelöst:

- kein Todo-Eintrag
- kein Discord-Post
- kein Reload
- keine Admin-POST-Routen
- keine DB-Änderung
- keine Textänderung
- keine Configänderung
- keine produktiven Flows

## Geänderte Dateien in CAN-43.7

- `docs/current/CAN-43.7_todo_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_7.md`
- `docs/modules/TODO.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests nach Entpacken

```powershell
node -c backend\modules\todo.js
.\stepdone.cmd "CAN-43.7 Todo diagnostics review"
```
