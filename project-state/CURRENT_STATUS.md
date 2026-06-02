# CURRENT_STATUS

## Stand: CAN-26.2 vorbereitet

CAN-26.0/26.1 wurden im Chat gegen Live getestet. CAN-26.2 liefert einen kleinen Diagnose-Cleanup fuer den Overlay-Monitor.

## Aktueller Arbeitsbereich

```text
CAN-26: Abschluss-/Qualitaetscheck fuer Bus-Diagnose, Git/Live-Synchronisation und Overlay-Monitor Scene-Awareness
```

## Aktueller stabiler Stand

CAN-25 wurde von der Sound-Shadow Summary Card ueber Bus-Matrix-/Alert-/Overlay-Diagnose bis zur scene-aware Overlay-Monitor-Anzeige weitergefuehrt.

CAN-26.0 pruefte GitHub/dev gegen Live und bestaetigte, dass die relevanten technischen Dateien fuer Bus-/Overlay-Diagnose identisch waren.

CAN-26.1 reparierte die Overlay-Monitor Scene-Awareness:

```text
- currentProgramSceneName faellt nicht mehr blind auf sceneNames[0] zurueck.
- Wenn keine echte OBS-Program-Szene bekannt ist, wird kein Overlay als activeExpected markiert.
- Der Test mit Szene "Live Gameplay Engel" bestaetigte:
  frame_overlay -> expected_inactive / activeExpected false / warning 0 / error 0
```

CAN-26.2 ergaenzt Diagnosefelder auf Top-Level von `/api/overlay-monitor/client-control/status`, damit PowerShell-/Dashboard-Diagnosen nicht nur pro Client, sondern auch direkt auf der Route sehen, welche Program-Szene und welchen Scene-Awareness-Modus der Monitor verwendet.

## Letztes Testergebnis

CAN-26.1 Test in Szene ohne Rahmen:

```text
currentProgramSceneName  : Live Gameplay Engel
id                       : overlay:frame_overlay
rawStatus                : online
status                   : expected_inactive
monitorStatus            : expected_inactive
activeExpected           : False
expectedInactive         : True
expectedNotActive        : True
currentProgramSceneKnown : True
sceneAwarenessMode       : program_scene_known
```

Summary nach CAN-26.1:

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

## Wichtige Erkenntnisse

```text
Overlay-HTMLs senden Heartbeats korrekt.
Scene-Awareness muss immer nach echter OBS-Program-Szene bewerten.
Ein online Overlay kann korrekt expected_inactive sein, wenn seine OBS-Quelle in der aktuellen Program-Szene nicht aktiv erwartet wird.
Top-Level-Diagnosefelder auf client-control/status erleichtern weitere Pruefung.
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
```

## Naechster Schritt

```text
CAN-26.2 ZIP entpacken, node -c pruefen, stepdone ausfuehren, Node neu starten und /api/overlay-monitor/client-control/status Top-Level-Felder pruefen.
Danach CAN-26.3 planen: naechsten technischen Kandidaten oder Doku-/Dashboard-Feinschliff entscheiden.
```
