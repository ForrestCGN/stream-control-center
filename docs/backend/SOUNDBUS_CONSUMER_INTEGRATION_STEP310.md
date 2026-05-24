# STEP310 – SoundBus Consumer Integration Block

Stand: 2026-05-24

## Ziel

Die nächsten soundnahen Systeme werden nicht einzeln per Mini-Step angebunden, sondern über einen gemeinsamen SoundBus-Consumer-Kontext vorbereitet.

Betroffene Systeme/Quellen:

- Alerts / Alert-TTS
- SoundAlerts / Channel Rewards
- VIP-/Mod-Sounds
- normales TTS
- Clip-/Birthday-/sonstige Sounds, sofern sie über das Sound-System laufen

## Umsetzung

### Backend

Datei:

```text
backend/modules/sound_system.js
```

Ergänzt wurde ein normalisierter `context` in jedem SoundBus-Event.

Der Kontext enthält unter anderem:

```text
source
sourceModule
category
requestedBy
soundId
label
requestId
target
outputTarget
mediaType
file
priority
durationMs
bundleId
bundleType
bundleRole
bundleOrder
bundleSize
alertEventUid
alertSource
alertType
vipRequestId
soundType
traceKind
activeBundleLockId
```

Zusätzlich speichert das Sound-System einen kleinen Runtime-Cache:

```text
soundBus.recentEvents
```

Dieser Cache ist rein diagnostisch und enthält die letzten 80 SoundBus-Event-Zusammenfassungen.

Wichtig: `publicSoundSummary()` gibt den SoundBus-Status ohne Recent-Events zurück, damit Bus-Payloads nicht durch verschachtelte History unnötig anwachsen.

### Dashboard

Dateien:

```text
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
```

Der bestehende Bus-Monitor zeigt jetzt zusätzlich:

- Quellen-Zusammenfassung aus dem Runtime-Cache
- letzte SoundBus-Events
- Aktion/Grund
- Label/Sound-ID
- Quelle/Kategorie/User
- Bundle-Rolle und Bundle-ID
- Zeitstempel

## Nicht geändert

- keine Queue-Logik
- keine Bundle-/activeBundleLock-Logik
- keine Sound-Playback-Logik
- keine Discord-Routing-Logik
- keine Alert-Output-Modi
- keine alten HTTP-/WebSocket-Wege entfernt
- keine Bus-only-Migration
- keine DB-Migration

## Erwarteter Test

1. Dashboard öffnen:

```text
http://127.0.0.1:8080/dashboard/
```

2. Sound-System → Bus-Monitor öffnen.
3. Test-Sound auslösen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?id=test_ping"
```

4. Erwartung:

```text
soundBus.enabled = true
soundBus.stats.errors = 0
recentEvents enthält starting/started/finished
Dashboard zeigt Quelle/Kategorie/Label im Bus-Monitor
```

5. Optional größerer Test:

```text
tools\easy\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd
```

Erwartung:

```text
Alert-Bundles bleiben zusammen
SoundAlerts/Mod/TTS erscheinen als unterscheidbare Quellen
activeBundleLock am Ende leer
queuedCount am Ende 0
soundBus.errors = 0
```
