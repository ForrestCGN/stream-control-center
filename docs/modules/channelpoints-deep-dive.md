# Modul-Doku: `channelpoints`

Stand: 2026-05-26 / STEP489_CHANNELPOINTS_BACKEND_SKELETON

## Zweck

`channelpoints` ist das geplante zentrale Kanalpunkte-System fuer Twitch Custom Rewards.

STEP489 erstellt nur das sichere Backend-Skelett:

- eigenes Fachmodul `backend/modules/channelpoints.js`
- Statusroute unter `/api/channelpoints/status`
- harmloser Bus-Selftest unter `/api/channelpoints/bus-test`
- Modul-Registrierung am bestehenden Communication Bus
- Status-/Heartbeat-Publish ueber den in STEP488 integrierten Bus-Contract
- keine Twitch-Schreibaktionen
- keine Datenbank-Migration
- kein Dashboard-Umbau

## Hauptdateien

```text
backend/modules/channelpoints.js
docs/modules/channelpoints-deep-dive.md
```

## Version / Meta

```text
module: channelpoints
moduleVersion: 0.1.0
routePrefix: /api/channelpoints
```

Das Modul exportiert:

```text
MODULE_META
init
buildStatus
registerAtCommunicationBus
heartbeatBus
publishStatus
```

## HTTP-Routen

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/channelpoints/status` | Status des Kanalpunkte-Skeletts, Bus-Status, geplante Twitch-Funktionen |
| GET | `/api/channelpoints/bus-test` | Harmloses Test-Event `channelpoints.test/ping` in den Bus senden |

## Statusfelder

`/api/channelpoints/status` liefert u. a.:

```text
ok
module
moduleVersion
routePrefix
enabled
mode
config
twitch
localState
bus
routes
```

Wichtige Twitch-Felder im STEP489-Skelett:

```text
twitch.rewardManagementImplemented: false
twitch.rewardSyncImplemented: false
twitch.redemptionHandlingImplemented: false
twitch.writeActionsEnabled: false
twitch.requiredManageScope: channel:manage:redemptions
twitch.requiredReadScope: channel:read:redemptions
```

## Communication Bus / Events

Das Modul nutzt den bestehenden Bus aus:

```text
backend/modules/communication_bus.js -> getBus()
backend/modules/helpers/helper_communication.js -> registerModule / heartbeatModule / publishModuleStatus / subscribe / emit
```

Beim Init:

```text
registerModule({ module: channelpoints, version: 0.1.0, capabilities: [...] })
subscribe(channelpoints.test / ping)
heartbeatModule(channelpoints)
publishModuleStatus(channelpoints)
```

Capabilities:

```text
module.lifecycle
module.status
channelpoints.status
channelpoints.test.ping
```

Gesendete Events:

| Channel | Action | Ausloeser |
|---|---|---|
| `module.lifecycle` | `registered` | Bus-Core durch `registerModule` |
| `module.status` | `updated` | `publishStatus()` |
| `channelpoints.test` | `ping` | `/api/channelpoints/bus-test` |

Empfangene Events:

| Channel | Action | Zweck |
|---|---|---|
| `channelpoints.test` | `ping` | Selftest fuer in-process Subscriptions |

## Config

Das Modul versucht optional zu laden:

```text
config/channelpoints.json
```

Die Datei wird in STEP489 nicht angelegt und nicht erzwungen.

Default-Config im Modul:

```text
enabled: true
busEnabled: true
busSelfTestEnabled: true
twitchRewardManagementEnabled: false
twitchRewardSyncEnabled: false
dashboardEnabled: false
```

## Datenbank

STEP489 legt keine Tabellen an.

Geplante spaetere Tabellen, noch nicht umgesetzt:

```text
channelpoint_categories
channelpoint_rewards
channelpoint_redemptions
channelpoint_sync_log
```

Regel bleibt: SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite` niemals ersetzen oder ueberschreiben. Spaetere Schemaaenderungen nur additiv.

## Twitch / API-Zielbild

Spaeter soll das Modul Twitch Custom Rewards verwalten:

```text
Rewards lesen/synchronisieren
Rewards erstellen
Rewards bearbeiten
Rewards aktivieren/deaktivieren
Redemptions empfangen
Redemptions erfuellen/abbrechen
```

Verbindliche Fachregel:

```text
Deaktivieren = Twitch Custom Reward per API auf is_enabled:false setzen.
```

Nicht nur lokal abschalten.

## Dashboard-Zielbild

Noch nicht in STEP489 umgesetzt.

Geplante Tabs:

```text
Uebersicht
Rewards
Kategorien
Aktionen
Queue
Medien
Texte
Statistik
Settings
Test
```

Geplante Dashboard-Funktionen:

```text
Reward-Liste
Kategorien
Sortierung
Aktiv/Inaktiv
Twitch-Sync
Testbutton
Upload-/Media-Zuordnung
Action-Verknuepfung
Statistik/History
```

## Bekannte Grenzen in STEP489

- Keine Twitch-Scopes werden geprueft.
- Keine Reward-Liste wird von Twitch gelesen.
- Keine Rewards werden erstellt/geaendert/deaktiviert.
- Keine Redemptions werden verarbeitet.
- Keine DB-Tabellen werden angelegt.
- Kein Dashboard-Modul wird erstellt.

## Tests

Syntax:

```bat
node --check backend\modules\channelpoints.js
```

Nach `stepdone.cmd` und Server-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
```

Erwartung:

```text
/api/channelpoints/status ok=True
bus.registered=True
/api/channelpoints/bus-test result.ok=True
subscriberDeliveredCount >= 1
/api/communication/status zeigt channelpoints als Modul-Client und eine channelpoints Subscription
```

## Offene Punkte

- Nach Runtime-Test pruefen, ob `communication_bus.js` `coreVersion` noch von 0.3.0 auf 0.4.0 nachgezogen werden soll.
- STEP490: Twitch-Readiness-/Scope-Check fuer Kanalpunkte planen.
- STEP491: Reward-Sync nur lesend vorbereiten.
- Spaeter: Dashboard-Modul mit Kategorien, Sortierung und Aktiv/Inaktiv.
