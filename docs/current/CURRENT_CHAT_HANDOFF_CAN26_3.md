# Current Chat Handoff - CAN26.3

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-26.3 vorbereitet: Git/Live-Abgleich, Overlay-Monitor Scene-Awareness Fix, Top-Level-Diagnosefelder und Dashboard-Sichtpruefung wurden abgeschlossen und dokumentiert.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene CAN-26 Schritte

```text
CAN-26.0  GitHub/dev und Live-System bewusst abgeglichen.
CAN-26.1  Overlay-Monitor Scene-Awareness Diagnose-Fix.
CAN-26.2  Overlay-Monitor client-control Top-Level Diagnosefelder.
CAN-26.3  Doku- und Handoff-Aktualisierung inkl. Dashboard-Sichtpruefung.
```

## Relevante Dateien

```text
backend/modules/overlay_monitor.js
htdocs/dashboard/modules/bus_diagnostics.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN26_3.md
```

## Aktueller technischer Stand Overlay-Monitor

```text
Modul: overlay_monitor
Version: 0.1.8
Status API: 1.0.8
Build: CAN-26.2
```

CAN-26.1/26.2 haben geloest:

```text
- Kein blinder currentProgramSceneName-Fallback auf sceneNames[0].
- Bei fehlender/unklarer Program-Szene keine automatische activeExpected-Bewertung.
- Top-Level-Diagnosefelder in /api/overlay-monitor/client-control/status sichtbar.
```

## Bestaetigte API-Tests

Top-Level-Diagnosefelder:

```text
currentProgramSceneName  : Live Gameplay Engel
currentPreviewSceneName  :
currentProgramSceneKnown : True
sceneAwarenessMode       : program_scene_known
inventoryUpdatedAt       : 2026-06-02T11:24:54.748Z
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

## Dashboard-Sichtpruefung

Per Screenshot bestaetigt:

```text
SYSTEME-Bereich lesbar.
Keine langen Detailbloecke in Tabellenzellen.
Overlay-Monitor Summary: 0 Warnungen / 0 Fehler.
Rahmen Overlay: EXPECTED_INACTIVE korrekt.
Bus-Matrix: read-only aktiv.
Sicherheitsgrenze: keine Aktion wird ausgefuehrt.
Sound-Bus Dry-Run: bereit, aber kein Play/Sound/Queue-Touch.
```

## Bekannte Beobachtungen / spaeter pruefen

```text
Doppelte lokale Struktur D:\Git\stream-control-center\htdocs\htdocs\... existiert.
Nicht blind loeschen, spaeter separat pruefen.

Dashboard SYSTEME-Bereich ist funktional wieder lesbar, kann spaeter aber optisch noch feiner/flacher werden.

Node-Log kann bei OBS-Szenenwechseln weiterhin WS disconnect/connect zeigen. Das ist nicht automatisch kritisch.

currentPreviewSceneName kann ohne Studio-Modus leer sein. Das ist erwartbar und nicht kritisch.
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
Keine Dashboard-Buttons fuer produktive Aktionen.
```

## Empfohlener Start im neuen Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN26_3.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-26.3 abgeschlossen. Nächster Schritt: CAN-27.0 planen, aber zuerst GitHub/dev und Live-System erneut bewusst abgleichen.
```

## Empfohlener CAN-27.0 Start

```text
CAN-27.0 - Neuen Arbeitsblock bewusst planen
```

Vor Code pruefen:

```text
- GitHub/dev und Live-Dateien bewusst abgleichen.
- Echte Dateien lesen.
- Ziel, Dateien, geplante Aenderung, Nicht-Aenderung und Tests nennen.
- Auf go warten.
```
