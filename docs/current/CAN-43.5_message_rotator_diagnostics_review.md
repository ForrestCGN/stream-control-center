# CAN-43.5 Message-Rotator Diagnostics Review

Stand: 2026-06-03 12:45

## Ziel

`message_rotator` wurde als viertes CAN-43-Fachmodul nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Dies war ein reiner Doku-/Abnahme-Step.

## Geprüfter Stand

Repo:

```text
Branch: dev
HEAD: ab6e7a1d CAN-43.4 Birthday diagnostics review
Git-Status: sauber
```

Registry-Coverage:

```text
ok=True
registryEntries=14
loadedModules=52
coveredLoadedModules=14
missingLoadedModules=0
registryOnlyEntries=0
```

## Modulstatus

Live-Endpunkt:

```text
GET /api/message-rotator/status
```

Bestätigte Werte:

```text
ok=True
module=message_rotator
moduleVersion=0.1.1
moduleBuild=diagnostics-standard
version=0.1.1
active=False
routeCount=46
```

## Diagnostics

Bestätigte Werte:

```text
ok=True
health=ok
module=message_rotator
version=0.1.1
build=diagnostics-standard
schemaVersion=
schemaReady=True
lastError=
```

Counts:

```text
items=3
enabledItems=3
disabledItems=0
manualCommands=5
textKeys=3
routes=46
apiRoutes=23
legacyRoutes=23
totalTicks=0
ignoredTicks=0
sendCount=0
chatMessagesSinceLastSend=0
itemState=0
manualState=0
```

Runtime:

```text
active=False
startedAt=
stoppedAt=
lastTickAt=
lastSentAt=
lastItemId=
lastMessageKey=
```

Config:

```text
enabled=True
onlyWhenLive=False
startActiveOnServerStart=False
globalCooldownMinutes=20
minChatMessagesBetweenRotations=8
```

## Routenübersicht

Read-only-Endpunkt:

```text
GET /api/message-rotator/routes
```

Bestätigte Werte:

```text
ok=True
module=message_rotator
version=1
standardPrefix=/api/message-rotator
count=46
```

Kategorien:

```text
admin
config
control
diagnostics
legacy
runtime
send
settings
status
```

## Integration-Check

Read-only-Endpunkt:

```text
GET /api/message-rotator/integration-check
```

Bestätigte Werte:

```text
ok=True
module=message_rotator
version=1
healthy=True
warnings leer
errors leer
```

Config-Check:

```text
ok=True
enabled=True
configPath=D:\Streaming\stramAssets\config\message_rotator.json
itemCount=3
enabledItems=3
source=database_with_json_fallback
settingsTable=message_rotator_settings
error=
```

Runtime-Check:

```text
ok=True
active=False
totalTicks=0
ignoredTicks=0
sendCount=0
chatMessagesSinceLastSend=0
lastSentAt=
lastItemId=
liveStatus.reason=not_checked
```

LiveStatusConfig:

```text
ok=True
enabled=True
mode=twitch_stream_route
url=http://localhost:8080/api/twitch/stream?login=forrestcgn
failClosed=True
cacheSeconds=15
```

## Prüfergebnis

`message_rotator` erfüllt den CAN-43 Diagnose-/Registry-Standard.

Bestätigt:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Registry-Eintrag vorhanden.
- Coverage sauber.
- Integration-Check sauber.
- Routenübersicht vorhanden.
- Modulversion und Build dokumentiert.
- Runtime war beim Test nicht aktiv.
- Keine Nachricht wurde gesendet.
- Keine produktive Route wurde ausgelöst.

## Bewusst nicht ausgelöst

Folgende produktive/aktive Routen wurden nicht verwendet:

- `GET/POST /api/message-rotator/reload`
- `GET/POST /api/message-rotator/start`
- `GET/POST /api/message-rotator/stop`
- `GET/POST /api/message-rotator/tick`
- `GET/POST /api/message-rotator/next`
- `GET/POST /api/message-rotator/manual`
- schreibende Admin-Routen

## Nicht geändert

- Kein Backend-Code.
- Keine Dashboard-Datei.
- Keine Datenbank.
- Keine Registry.
- Keine Modulversion.
- Keine Config.
- Keine Texte.
- Kein Rotator-Start.
- Kein Rotator-Stop.
- Kein Reload.
- Kein Tick.
- Kein Next/Manual-Send.
- Keine Chat-Ausgabe.
- Keine produktiven Flows.
