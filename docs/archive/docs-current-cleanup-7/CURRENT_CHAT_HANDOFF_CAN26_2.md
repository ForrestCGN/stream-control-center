# Current Chat Handoff - CAN26.2

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
```

## Aktueller Stand

CAN-26.1 wurde live gegen OBS/Node getestet und bestaetigt: In einer Program-Szene ohne Rahmen wird `overlay:frame_overlay` korrekt als `expected_inactive` bewertet, obwohl der Bus-Client technisch online ist.

CAN-26.2 vorbereitet: kleiner Diagnose-Cleanup fuer `/api/overlay-monitor/client-control/status`, damit die verwendete Program-Szene und der Scene-Awareness-Modus auch auf Top-Level sichtbar sind.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## CAN-26 Ergebnisse

```text
CAN-26.0  GitHub/dev und Live-Dateien fuer Bus-/Overlay-Diagnose abgeglichen.
CAN-26.1  Overlay-Monitor Scene-Awareness repariert.
CAN-26.2  Top-Level-Diagnosefelder fuer client-control/status vorbereitet.
```

## CAN-26.1 bestaetigter Test

Szene ohne Rahmen: `Live Gameplay Engel`

```text
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

Summary:

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

## CAN-26.2 Aenderung

```text
backend/modules/overlay_monitor.js
```

Versionen:

```text
overlay_monitor: 0.1.8
statusApiVersion: 1.0.8
build: CAN-26.2
```

Top-Level-Felder in `/api/overlay-monitor/client-control/status`:

```text
sceneAwareness
currentProgramSceneName
currentPreviewSceneName
currentProgramSceneKnown
sceneAwarenessMode
inventoryUpdatedAt
inventoryFromCache
inventoryFromMemory
```

## Weiterhin verboten / nicht passiert

```text
Keine OBS-Reparatur.
Kein Browser-Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Kein Overlay-HTML-Umbau.
Kein Sound-Play.
Keine Queue-Aktion.
Keine Twitch-/Redemption-Write-Aktion.
Keine produktive Sound-Bus-Migration.
```

## Empfohlener Start im naechsten Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN26_2.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-26.2 vorbereitet/abgeschlossen je nach stepdone-Test. Naechster Schritt: CAN-26.2 Testergebnis pruefen und danach CAN-26.3 planen.
```

## CAN-26.2 Test

```powershell
$o = Invoke-RestMethod "http://127.0.0.1:8080/api/overlay-monitor/client-control/status"
$o | Select-Object currentProgramSceneName,currentPreviewSceneName,currentProgramSceneKnown,sceneAwarenessMode,inventoryUpdatedAt,inventoryFromCache,inventoryFromMemory | Format-List
```
