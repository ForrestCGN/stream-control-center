# CAN-43.6 Tagebuch Diagnostics Review

Stand: 2026-06-03 13:00

## Ziel

Das Modul `tagebuch` wurde als fünftes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dieser Step ist ein reiner Doku-/Abnahme-Step.

## Ergebnis

`tagebuch` ist sauber.

- Repo/Live-Abgleich sauber.
- `tagebuch` live aktiv/geladen.
- `GET /api/tagebuch/status` vorhanden.
- `diagnostics`-Block vorhanden.
- `GET /api/tagebuch/routes` vorhanden.
- `GET /api/tagebuch/integration-check` sauber.
- Registry-Eintrag vorhanden.
- Coverage sauber.
- Keine Codeänderung nötig.

## Bestätigte Repo-/Live-Werte

```text
Branch: dev
HEAD: d196fee2 CAN-43.5 Message-Rotator diagnostics review
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
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status"
```

Ergebnis:

```text
ok=True
module=tagebuch
version=2
schemaVersion=5
databasePath=D:\Streaming\stramAssets\data\sqlite\app.sqlite
configPath=D:\Streaming\stramAssets\config\tagebuch.json
messagesPath=D:\Streaming\stramAssets\config\messages\tagebuch.json
```

State:

```text
currentPageNumber=36
currentPageDate=2026-06-02
nextPageNumberIfNewDate=37
localDateToday=2026-06-03
lastStreamStartedAt=2026-06-02T15:00:04.358Z
lastStreamEndedAt=2026-06-02T18:48:44.802Z
activeStream=False
hasEntriesForCurrentDate=True
endNoticePostedForCurrentDate=False
updatedAt=2026-06-02T18:48:44.803Z
```

## Diagnostics

```text
ok=True
health=ok
module=tagebuch
version=0.1.0
schemaVersion=5
schemaReady=True
lastError=
```

Counts:

```text
state=1
runtimeEvents=265
userStats=11
dailyUserStats=42
settings=20
textVariants=17
legacyTexts=17
```

Diagnostics-State:

```text
activeStream=False
currentPageNumber=36
currentPageDate=2026-06-02
hasEntriesForCurrentDate=True
endNoticePostedForCurrentDate=False
```

Webhook:

```text
useDiscordWebhook=True
hasWebhookUrl=True
webhookUrlEnv=DISCORD_WEBHOOK_TAGEBUCH
```

## Routen

Geprüft:

```powershell
$tr = Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/routes"
```

Ergebnis:

```text
ok=True
module=tagebuch
version=1
standardPrefix=/api/tagebuch
count=32
```

Kategorien:

```text
admin
config
diagnostics
entry
legacy
lifecycle
reset
settings
stats
status
```

## Integration-Check

Geprüft:

```powershell
$ti = Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/integration-check"
```

Ergebnis:

```text
ok=True
module=tagebuch
version=1
schemaVersion=5
healthy=True
warnings leer
errors leer
```

Config:

```text
ok=True
path=D:\Streaming\stramAssets\config\tagebuch.json
messagesPath=D:\Streaming\stramAssets\config\messages\tagebuch.json
source=database_with_json_fallback
hasWebhookUrl=True
error=
```

Database:

```text
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=5
expectedSchemaVersion=5
error=
```

State:

```text
ok=True
activeStream=False
currentPageNumber=36
currentPageDate=2026-06-02
localDateToday=2026-06-03
error=
```

Webhook:

```text
ok=True
useDiscordWebhook=True
hasWebhookUrl=True
webhookUrlEnv=DISCORD_WEBHOOK_TAGEBUCH
error=
```

## Nicht ausgelöst

Für diesen Review wurden ausschließlich read-only Endpunkte genutzt.

Nicht ausgelöst:

- kein Streamstart
- kein Streamende
- kein Tagebuch-Eintrag
- kein Reset
- kein Reload
- keine Admin-POST-Routen
- kein Discord-Post
- keine DB-Änderung
- keine Textänderung
- keine Configänderung
- keine produktiven Flows

## Geänderte Dateien in CAN-43.6

- `docs/current/CAN-43.6_tagebuch_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_6.md`
- `docs/modules/TAGEBUCH.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests nach Entpacken

```powershell
node -c backend\modules\tagebuch.js
.\stepdone.cmd "CAN-43.6 Tagebuch diagnostics review"
```
