# CURRENT_STATUS

## Stand: CAN-26.5 vorbereitet

Deploy-Doku-Sync wurde als eigener Mini-Schritt vorbereitet. CAN-26.4 hatte die Doku-/Projektstandsdateien im Repo aktualisiert, aber der bestehende Deploy-Workflow kopierte `docs` und `project-state` nicht ins Live-System.

## Aktueller Arbeitsbereich

```text
CAN-26: Git/Live-Abgleich, Overlay-Monitor Scene-Awareness, Bus-Diagnose, Dashboard-Sichtpruefung und Deploy-Doku-Sync
```

## Aktueller stabiler Stand

CAN-26 wurde nach CAN-25.25b als Abschluss-/Qualitaetscheck fuer Bus-Diagnose und Overlay-Monitor durchgefuehrt.

Abgeschlossen und live getestet:

```text
CAN-26.0 GitHub/dev und Live-System bewusst abgeglichen.
CAN-26.1 Overlay-Monitor Scene-Awareness Diagnose-Fix.
CAN-26.2 Overlay-Monitor client-control Top-Level Diagnosefelder.
CAN-26.3 Doku- und Handoff-Aktualisierung inkl. Dashboard-Sichtpruefung.
CAN-26.4 Live-Doku-Sync und NEXT_STEPS-Bereinigung im Repo vorbereitet.
```

CAN-26.5 vorbereitet:

```text
tools/deploy_repo_to_streamassets.ps1 soll docs/current, docs/system-inspection, docs/modules und project-state mit nach Live deployen.
```

## Technischer Stand Overlay-Monitor

```text
backend/modules/overlay_monitor.js
Version: 0.1.8
Status API: 1.0.8
Build: CAN-26.2
```

CAN-26.1 hat verhindert, dass bei fehlender/unklarer Program-Szene blind `sceneNames[0]` als aktive Szene verwendet wird. Bei unbekannter Program-Szene wird safe-inactive bewertet und kein Overlay automatisch als `activeExpected` markiert.

CAN-26.2 hat die Top-Level-Diagnosefelder in `/api/overlay-monitor/client-control/status` sichtbar gemacht:

```text
currentProgramSceneName
currentPreviewSceneName
currentProgramSceneKnown
sceneAwarenessMode
inventoryUpdatedAt
inventoryFromCache
inventoryFromMemory
```

## Letzte bestaetigte Testergebnisse

API-Test ohne Rahmen in Program-Szene `Live Gameplay Engel`:

```text
currentProgramSceneName  : Live Gameplay Engel
currentProgramSceneKnown : True
sceneAwarenessMode       : program_scene_known
inventoryFromCache       : False
inventoryFromMemory      : False
```

Frame-Overlay in Szene ohne Rahmen:

```text
id                       : overlay:frame_overlay
name                     : Rahmen Overlay
rawStatus                : online
status                   : expected_inactive
monitorStatus            : expected_inactive
activeExpected           : False
expectedInactive         : True
expectedNotActive        : True
currentProgramSceneName  : Live Gameplay Engel
currentProgramSceneKnown : True
sceneAwarenessMode       : program_scene_known
```

Overlay-Monitor Summary nach CAN-26.1/26.2:

```text
total             : 10
online            : 7
info              : 3
warning           : 0
error             : 0
heartbeat         : 10
stale             : 0
dead              : 0
expectedInactive  : 1
expectedIdle      : 2
expectedNotActive : 3
activeExpected    : 8
```

Dashboard-Sichtpruefung:

```text
SYSTEME-Bereich lesbar: ja
Lange Detailbloecke in Tabellenzellen: nein
Overlay-Monitor Summary: 0 Warnungen / 0 Fehler
Rahmen Overlay: EXPECTED_INACTIVE korrekt
Bus-Matrix: read-only aktiv
Sicherheitsgrenze: keine Aktion wird ausgefuehrt
Sound-Bus Dry-Run: bereit, aber kein Play/Sound/Queue-Touch
```

## Wichtige Erkenntnisse

```text
Overlay-Clients koennen technisch online sein, ohne in der aktuellen Program-Szene aktiv erwartet zu werden.
rawStatus bleibt sichtbar, monitorStatus bewertet scene-aware.
currentProgramSceneName ist die entscheidende Diagnosequelle, nicht Preview.
Ohne Studio-Modus kann currentPreviewSceneName leer sein; das ist nicht kritisch.
OBS-Inventar-Refresh ueber /api/overlay-monitor/obs-inventory?refresh=1 bleibt read-only und fuehrt keine Reparatur aus.
stepdone.cmd staged docs/project-state, aber deploy_repo_to_streamassets.ps1 muss diese Pfade explizit nach Live kopieren.
```

## Weiterhin verboten / nicht passiert

```text
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Kein Overlay-HTML-Umbau.
Kein Sound-Play.
Keine Queue-Aktion.
Keine Twitch-/Redemption-Write-Aktion.
Keine produktive Sound-Bus-Migration.
Keine Dashboard-Buttons fuer produktive Aktionen.
```

## Naechster Schritt

```text
CAN-26.5 ZIP entpacken, stepdone ausfuehren und danach Hash-Abgleich fuer docs/project-state pruefen. Danach CAN-27.0 planen.
```
