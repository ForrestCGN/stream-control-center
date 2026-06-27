# CURRENT CHAT HANDOFF – Shot-Alarm STEP 2A

Stand: 2026-06-18  
Step: `SHOT-ALARM-2A Aggregated Draw Overlay Counter`

## Fertig

Shot-Alarm wurde von Einzeltriggern auf gebündelte Auslosung umgebaut.

- Support-Event erzeugt intern mehrere Würfe.
- Ergebnis wird pro Event zusammengefasst.
- Startphase: Auslosung läuft.
- Nach 10 Sekunden: Ergebnis.
- Offene Shots werden erst beim Ergebnis erhöht.
- Overlay zeigt oben eine kleine Karte.
- Overlay zeigt unten dauerhaft eine dezente Statusleiste.
- Statusleiste zeigt offen/getrunken/gesamt.
- Chat-Ausgabe nutzt Altersheim-/Heimleitungs-Textpools aus Config.
- Sound wird nur einmal pro Ergebnis bei Treffer angefordert.

## Aktuelle Dateien

- `backend/modules/shot_alarm.js`
- `config/shot_alarm.json`
- `htdocs/dashboard/modules/shot_alarm.js`
- `htdocs/dashboard/modules/shot_alarm.css`
- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`
- `docs/modules/shot_alarm.md`
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2A.md`
- `project-state/*`

## Version

`backend/modules/shot_alarm.js`

- `moduleVersion: 0.2.0`
- `moduleBuild: STEP_SHOT_ALARM_2A_AGGREGATED_DRAW_OVERLAY_COUNTER`

## Wichtig

Workflow nach Masterprompt:

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Deploy/Live-Kopie ausführen.
3. Danach `stepdone.cmd` ausführen.
4. Backend neu starten.
5. Danach testen.
6. Bei erfolgreichem Test kein zweites StepDone.

## Tests

Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,enabled,busAvailable,registeredOnBus,routeCount,lastError,shotsOpen,shotsDrunk,shotsAddedTotal
```

Schnelltest ohne 10 Sekunden Wartezeit:

```powershell
$body = @{ type='bits'; user='BitRentner'; bits=25000; forceRoll=0; immediate=$true } | ConvertTo-Json
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/test" -Method POST -ContentType "application/json" -Body $body
$r.summary | Select-Object amountLabel,chanceSummary,rollsTotal,shotsAdded,shotsOpenAfter
```

Echter Ablauf mit 10 Sekunden Auslosung:

```powershell
$body = @{ type='bits'; user='BitRentner'; bits=25000; forceRoll=0 } | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/test" -Method POST -ContentType "application/json" -Body $body
```

Nach ca. 10 Sekunden:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/history" | ConvertTo-Json -Depth 8
```

Shot abhaken:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/shot-done" -Method POST -ContentType "application/json" -Body (@{ count=1; user='Engel' } | ConvertTo-Json)
```

## Offene Punkte

- `!shotdone` über vorhandenes Command-/Chat-System anbinden.
- Rechte: Engel/Roxxy/Broadcaster/Mods.
- Textvarianten in DB/Texthelper überführen.
- Dashboard-Texteditor und Statistik ausbauen.
- Ko-fi/Tipeee über Payment-Bus anbinden.
