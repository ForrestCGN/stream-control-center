# CURRENT CHAT HANDOFF CAN-43.14

Stand: 2026-06-03 14:45

## Projekt

Wir arbeiten am Projekt `stream-control-center`.

Repo:

- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`

## Abgeschlossener Stand

CAN-43.13 und CAN-43.14 sind abgeschlossen.

Die Module `overlay_monitor` und `bus_diagnostics` wurden per Batch-Export nach dem neuen Diagnose-/Registry-Standard geprüft und dokumentiert.

Batch-Datei:

```text
CAN-43_batch_20260603_141339.zip
```

## CAN-43.13 Overlay Monitor Ergebnis

`overlay_monitor` ist sauber.

- Repo/Live-Abgleich sauber.
- `overlay_monitor` live aktiv/geladen.
- `/api/overlay-monitor/status` vorhanden.
- `diagnostics`-Block vorhanden.
- `/api/overlay-monitor/client-control/status` vorhanden.
- `/api/overlay-monitor/client-control/classification` vorhanden.
- `/api/overlay-monitor/client-control/identity-contract` vorhanden.
- `/api/overlay-monitor/issues` vorhanden.
- `/api/overlay-monitor/obs-inventory?cache=1` vorhanden.
- `/api/overlay-monitor/events` vorhanden.
- `/api/overlay-monitor/routes` vorhanden.
- Registry-Eintrag `overlay_monitor` vorhanden.
- Coverage sauber.
- Keine aktiven Issues.
- Keine Diagnostics-Warnings/Errors.
- Keine OBS-Reparatur ausgelöst.
- Keine Browserquelle refreshed.
- Keine Codeänderung nötig.

Bestätigte Werte:

```text
module=overlay_monitor
moduleVersion=0.1.9
moduleBuild=diagnostics-standard
version=0.1.9
statusApiVersion=1.0.9
feature=overlay_monitor_read_only
readOnly=True
overlayTouched=False
obsTouched=False
refreshTouched=False
routeCount=9
summary.status=ok
summary.total=10
summary.online=7
summary.expectedInactive=1
summary.expectedIdle=2
summary.withHeartbeat=10
summary.withErrors=0
communication.available=True
communication.ok=True
communication.clientCount=16
sceneAwareness.currentProgramSceneName=Live Gameplay Forrest
sceneAwareness.sceneCount=18
sceneAwareness.sourceCount=111
diagnostics.ok=True
diagnostics.health=ok
diagnostics.schemaReady=True
diagnostics.warnings=[]
diagnostics.errors=[]
issues.active=0
issues.resolved=4262
inventory.summary.sources=111
inventory.summary.warnings=8
```

## CAN-43.14 Bus Diagnostics Ergebnis

`bus_diagnostics` ist sauber.

- `/api/bus-diagnostics/status` vorhanden.
- `/api/bus-diagnostics/routes` vorhanden.
- Registry-Eintrag `bus_diagnostics` vorhanden.
- Coverage sauber.
- Read-only.
- Keine Systeme produktiv berührt.
- Summary-Status `ok`.
- Keine Warnings.
- Keine Errors.
- Optionale Hinweise nur für nicht verbundene Debug-Clients.
- Keine Codeänderung nötig.

Bestätigte Werte:

```text
module=bus_diagnostics
version=1.2.9
statusApiVersion=1.0.0
feature=bus_dashboard_diagnostics
mode=read_only_dashboard_preparation
readOnly=True
requestedCheck=False
flowTouched=False
queueTouched=False
soundSystemTouched=False
alertSystemTouched=False
vipSystemTouched=False
overlayTouched=False
summary.status=ok
summary.communicationOk=True
summary.soundBusOk=True
summary.alertBusOk=True
summary.correlationOk=True
summary.vipOk=True
summary.vipIntegrationOk=True
summary.connectedClients=16
summary.totalClients=16
summary.matrixOk=True
summary.matrixWarnings=0
summary.matrixErrors=0
warnings=[]
errors=[]
optionalInfo=sound_eventbus_debug_not_connected_optional, alert_eventbus_debug_not_connected_optional
```

## Batch-Hinweis: Communication Bus

Im ersten Batch wurden für `communication_bus` falsche URLs abgefragt:

```text
/api/communication-bus/status
/api/communication-bus/routes
/api/communication-bus/diagnostics
/api/communication-bus/clients
```

Diese lieferten 404.

Die echte aggregierte Route laut `bus_diagnostics` ist:

```text
/api/communication/status
```

`communication_bus` ist deshalb noch nicht als eigener CAN-Step abgeschlossen.

## Geänderte Dateien

- `docs/current/CAN-43.13_overlay_monitor_diagnostics_review.md`
- `docs/current/CAN-43.14_bus_diagnostics_review.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN43_14.md`
- `docs/modules/OVERLAY_MONITOR.md`
- `docs/modules/BUS_DIAGNOSTICS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Nicht geändert

- Kein Backend-Code.
- Keine Dashboard-Datei.
- Keine Datenbank.
- Keine Registry.
- Keine Modulversion.
- Keine Config.
- Keine Texte.
- Keine OBS-Reparatur.
- Kein Browserquellen-Refresh.
- Keine Recovery-Aktion.
- Kein Sound-/Alert-/VIP-/Overlay-Flow.
- Keine produktiven Flows.

## Arbeitsregeln weiterhin verbindlich

- Erst echten Dateistand prüfen.
- Keine Funktionalität entfernen.
- Keine neuen Parallel-/Extra-Dateien ohne klare Begründung.
- Bei neuen oder geänderten Modulen Diagnose-Standard anwenden:
  - Statusroute prüfen
  - `diagnostics`-Block prüfen
  - Registry-Eintrag prüfen
  - Coverage-Test prüfen
  - Doku/project-state aktualisieren

## Nächster sinnvoller Schritt

CAN-43.15: `communication_bus` separat mit den echten `/api/communication/*`-Routen prüfen.

Empfohlener Mini-Export:

```powershell
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outDir = Join-Path (Get-Location) "diagnostics_exports\CAN-43_communication_$stamp"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function Save-Json($name, $url) {{
  try {{
    Invoke-RestMethod $url | ConvertTo-Json -Depth 80 | Out-File (Join-Path $outDir "$name.json") -Encoding utf8
  }} catch {{
    $_ | Out-String | Out-File (Join-Path $outDir "$name.ERROR.txt") -Encoding utf8
  }}
}}

Save-Json "00_registry" "http://127.0.0.1:8080/api/diagnostics/registry"
Save-Json "10_communication_status" "http://127.0.0.1:8080/api/communication/status"
Save-Json "11_communication_routes" "http://127.0.0.1:8080/api/communication/routes"
Save-Json "12_communication_clients" "http://127.0.0.1:8080/api/communication/clients"
Save-Json "13_communication_diagnostics" "http://127.0.0.1:8080/api/communication/diagnostics"

Compress-Archive -Path (Join-Path $outDir "*") -DestinationPath "$outDir.zip" -Force
Write-Host "ZIP: $outDir.zip"
```

Falls einige dieser Routen ebenfalls 404 liefern, ist das ok; daraus bestimmen wir den echten Routenstand.
