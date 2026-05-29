# Sound/Media/SoundBus Tech History – konsolidiert

Stand: 2026-05-29  
Erstellt in: STEP536B_SOUND_MEDIA_TECH_DOCS_CONSOLIDATION

## Ziel

Diese Datei konsolidiert alte Sound-/Media-/SoundBus-/Discord-Media technische STEP-Dokumente, die bisher verstreut unter `docs/backend`, `docs/dashboard` und `docs/media` lagen.

Die ursprünglichen Einzeldateien werden nicht vergessen, sondern nach Prüfung per Quarantine-Skript aus dem aktiven Doku-Bereich verschoben.

## Konsolidierter Scope

```text
docs/backend/BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY_STEP275B.md
docs/backend/DISCORD_MEDIA_PATH_AUDIT_STEP292.md
docs/backend/DISCORD_MEDIA_PATH_RESOLVER_FIX_STEP293.md
docs/backend/DISCORD_MEDIA_PATH_RESOLVER_RETEST_STEP294.md
docs/backend/MEDIA_REGISTRY_SOUND_BIRTHDAY_MEDIAID_STEP275.md
docs/backend/SOUND_SYSTEM_BUS_AUDIT_STEP288.md
docs/backend/SOUND_SYSTEM_MEDIAID_DIRECT_STEP275A.md
docs/backend/SOUNDBUS_BASE_TESTS_STEP290.md
docs/backend/SOUNDBUS_CONSUMER_DASHBOARD_PLAN_STEP298.md
docs/backend/SOUNDBUS_CONSUMER_INTEGRATION_STEP310.md
docs/backend/SOUNDBUS_DEBUG_VIEW_STEP296.md
docs/backend/SOUNDBUS_DEBUG_VIEW_TEST_STEP297.md
docs/backend/SOUNDBUS_OPERATION_DECISION_STEP295.md
docs/backend/SOUNDBUS_V5_REGRESSION_STEP291.md
docs/dashboard/SOUND_DASHBOARD_BACKEND_AUTH_VALIDATION_STEP301.md
docs/dashboard/SOUND_DASHBOARD_BUS_CONSUMER_CONTEXT_STEP310.md
docs/dashboard/SOUND_DASHBOARD_BUSMONITOR_AUTO_REFRESH_STEP303.md
docs/dashboard/SOUND_DASHBOARD_CONTROL_CENTER_STEP320.md
docs/dashboard/SOUND_DASHBOARD_MONITORING_STEP299.md
docs/dashboard/SOUND_DASHBOARD_MONITORING_TEST_STEP300.md
docs/dashboard/SOUND_DASHBOARD_READONLY_REFRESH_FIX_STEP302.md
docs/dashboard/SOUND_DASHBOARD_UI_CONTROL_STABILIZATION_STEP330.md
docs/media/MEDIA_SYSTEM_ARCHITECTURE_STEP274K.md
```

## Kurzfassung

Die alten Sound-/Media-/SoundBus-Dokus beschreiben diese Entwicklungslinie:

1. Media Registry wurde als gemeinsame Asset-/MediaId-Schicht vorbereitet.
2. Sound-System blieb zentrale Abspiel-/Queue-/Routing-Schicht.
3. Birthday, Alerts, SoundAlerts, VIP, TTS und Medienbrücken wurden schrittweise auf MediaId/Sound-System-Pfade ausgerichtet.
4. Discord-Media-Pfade wurden auditiert und repariert.
5. SoundBus wurde als zusätzliche Event-/Status-/Diagnose-Schicht aufgebaut, nicht als sofortiger Ersatz für bestehende HTTP-/WebSocket-Wege.
6. Sound-Dashboard bekam Monitoring, Bus-Monitor, Auto-Refresh, readonly/refresh-Fixes und später Control-Center-Stabilisierung.

## Sound-System Grundsatz

Das Sound-System bleibt Master für:

- Queue und Prioritäten
- Locked Bundles
- Alert-Hauptsound + Alert-TTS-Reihenfolge
- aktive Bundle-Sperre (`activeBundleLock`)
- Output-Ziele `overlay`, `device`, perspektivisch `both`
- optionales Discord-Routing über Discord-Bridge
- Overlay-Client-ACKs
- Device-Playback über AudioDeviceHelper
- Media-Registry-Dateien über `mediaId`/`mediaPath`

Kritische Schutzlogik darf nicht gebrochen werden:

```text
activeBundleLock schützt locked Bundles.
Alert-Bundle-Items umgehen Dedupe/Cooldowns.
Queue-Sortierung respektiert Bundle-Gruppierung.
Sound-System bleibt Master.
Device-/Overlay-/Discord-Ausgabe bleiben bestehend.
Overlay-Client-ACKs bleiben bestehend.
```

## Sound-System APIs / bestehende Wege

Die alten Dokus dokumentieren vorhandene Sound-System-Routen wie:

```text
GET  /api/sound/status
GET  /api/sound/current
GET  /api/sound/queue
GET  /api/sound/list
GET  /api/sound/config
GET  /api/sound/settings
POST /api/sound/settings
POST /api/sound/reload
GET  /api/sound/routes
GET  /api/sound/integration-check
GET  /api/sound/play
POST /api/sound/play
POST /api/sound/bundle
POST /api/sound/stop
POST /api/sound/skip
POST /api/sound/clear
POST /api/sound/pause
POST /api/sound/resume
POST /api/sound/reset
```

Wichtig:

```text
Der alte WebSocket-Statusweg op: sound_system bleibt erhalten.
Bestehende HTTP-APIs bleiben erhalten.
Keine Bus-only-Migration ohne separaten Test-/Freigabe-Step.
```

## SoundBus Zielbild

Der SoundBus ist zunächst eine zusätzliche Event-/Status-Schicht.

Grundsatz:

```text
Sound-System sendet Bus-Events.
Sound-System bleibt Master.
Module bleiben vorerst API-basiert.
Dashboard/Debug/Monitoring lesen Events.
Keine direkte Steuerung über Bus ohne separaten Plan.
```

Empfohlenes Eventmodell aus den alten Dokus:

```text
sound.queued
sound.starting
sound.started
sound.finished
sound.failed
sound.stopped
sound.skipped
sound.cleared
sound.paused
sound.resumed
sound.queue.updated
sound.bundle.queued
sound.bundle.lock_started
sound.bundle.lock_finished
sound.device.started
sound.device.finished
sound.device.failed
sound.discord.queued
sound.discord.failed
sound.client.ready
sound.client.audio_started
sound.client.audio_ended
sound.client.error
```

Wichtige Payload-/Kontext-Felder:

```text
requestId
soundId
label
category
source
sourceModule
requestedBy
target
outputTarget
priority
volume
mediaType
file/mediaUrl/audioUrl/videoUrl
durationMs
bundleId
bundleType
bundleRole
bundleOrder
bundleSize
alertEventUid
vipRequestId
activeBundleLockId
```

## SoundBus Consumer Regeln

Consumer-Klassen:

### Beobachter

```text
Keine ACKs standardmäßig.
Keine Produktionslogik beeinflussen.
```

### Dashboard-Consumer

```text
Dashboard liest Events und ruft Status über APIs ab.
Dashboard schreibt nicht direkt in SoundBus-Events.
Steueraktionen laufen weiterhin über Backend-APIs.
```

### Overlay-Consumer

```text
Erst nach separater Freigabe.
Explizites target/capability-Modell nötig.
Keine Wildcard-Produktionsabhängigkeit ohne Fallback.
```

### Modul-Consumer

```text
Module bleiben vorerst API-basiert.
Bus-Nutzung pro Modul separat planen, testen und dokumentieren.
```

## SoundBus Debug/Dashboard Verlauf

Konsolidierter Stand aus den STEP296–310-Dokus:

- SoundBus Debug View wurde gebaut.
- Debug View Tests wurden bestätigt.
- V5 Queue-/Bundle-Regression wurde bestanden.
- SoundBus wurde im Dev-/Testbetrieb aktiv (`soundBus.enabled = true`).
- Dashboard-Bus-Monitor zeigt Quellen-Zusammenfassung und letzte Events.
- Runtime-Cache `soundBus.recentEvents` ist diagnostisch und begrenzt.
- Bus-Payloads sollen nicht durch verschachtelte History unnötig anwachsen.

## SoundBus offene Punkte

Diese Punkte wurden aus den alten TODO-Hits gerettet.

### Doppeltes `sound.finished`

STEP297/STEP298 dokumentiert:

```text
sound.finished Test Ping = konkretes Item-Finish
sound.finished auto_finished = zusätzliches Lifecycle-/System-Finish
```

Aktuell kein akuter Fehler, aber Dashboard sollte dies klar darstellen oder später semantisch trennen.

Möglicher späterer Cleanup:

```text
sound.finished.item
sound.finished.auto
```

oder Payload-Flag:

```text
finishKind: item | lifecycle | auto
```

### Zielgruppen / Targets

Für spätere Produktiv-Consumer prüfen:

```text
targetType
targetId
targetModule
targetCapability
```

Keine produktive Wildcard-Abhängigkeit ohne Fallback.

### Schrittweise Migration

Migrationspfad aus STEP288:

```text
STEP289: Sound-System sendet Bus-Events, Caller bleiben unverändert.
STEP290: Debug View/Dashboard zeigt Sound-Bus-Events, Queue, Current, Bundle-Lock.
STEP291: Module dürfen Bus-Status lesen, spielen aber weiter über API.
STEP292: Optionaler Bus-Input sound.play, der intern dieselbe Sound-System-Queue nutzt.
STEP293+: Module schrittweise umstellen, zuerst unkritische Sounds, danach VIP/SoundAlerts/TTS, Alerts zuletzt oder nur nach erneutem Bundle-Test.
```

## Media Registry / MediaId

Die alten MediaId-Dokus dokumentieren:

- Media Registry verwaltet Assets/IDs.
- Sound-System bleibt Abspieler.
- Offizieller Hub ist `/api/sound/play-media` bzw. intern `/api/sound/play`.
- Birthday und Alerts sollen keine doppelten Dateikopien erzeugen, wenn MediaId/MediaRegistry genutzt werden kann.
- Sound-/Birthday-/Alert-Media sollen nicht über neue Parallelstrukturen laufen.

## Birthday / MediaId

Konsolidierter Stand:

- Birthday nutzt Sound-System für Sounds und Bundles.
- Birthday behandelt das Sound-System als Media-Master.
- MediaId-gestützte Sounds sollten keine unnötigen Kopien erzeugen.
- Bestehende Birthday-Funktionalität nicht entfernen.

## Discord Media Path

Die STEP292–294-Dokus dokumentieren Audit, Fix und Retest für Discord-Media-Pfade.

Konsolidierter Stand:

- Discord-Media-Pfade wurden geprüft.
- Resolver-Fix wurde dokumentiert.
- Retest bestätigte das erwartete Verhalten.
- Discord bleibt Ausgabeziel/Bridge, nicht unabhängiger Ersatz für Sound-System-Queue.
- Sound-System kann Discord-Routing intern an Discord-Bridge übergeben.

## Sound Dashboard

Die alten Dashboard-Dokus dokumentieren:

- Sound Dashboard Monitoring
- Backend Auth Validation
- Readonly Refresh Fix
- BusMonitor Auto Refresh
- Control Center Einbindung
- UI Control Stabilization
- Bus Consumer Context Anzeige

Konsolidierter Stand:

- Sound-Dashboard liest Status/Events über Backend-APIs/WebSocket-Kontext.
- Keine direkte DB-/Datei-Steuerung.
- Steueraktionen müssen weiterhin über Backend-APIs und Rechteprüfung laufen.
- Bus-Monitor bleibt Diagnose-/Monitoring-Werkzeug, nicht produktiver Steuerkanal.

## Media System Architecture

`docs/media/MEDIA_SYSTEM_ARCHITECTURE_STEP274K.md` gehört fachlich als Frühstand zur Media-/Sound-/Asset-Architektur.

Konsolidierter Stand:

- Media-System soll gemeinsame Asset-Strukturen und IDs bereitstellen.
- Sound-/Video-/Overlay-Verbraucher sollen nicht jeweils eigene inkompatible Asset-Strukturen erfinden.
- Diese Einzelnotiz kann nach Konsolidierung aus dem aktiven STEP-Doku-Bereich verschoben werden.

## Nicht aus dieser Konsolidierung ableiten

Diese Sammeldoku erlaubt keine Runtime-Änderung.

Bei späteren Sound-/Media-/SoundBus-Arbeiten immer:

- echte aktuelle Dateien prüfen
- keine Funktionalität entfernen
- `activeBundleLock`, Bundle-Reihenfolge, Dedupe/Cooldowns, Interrupt-Regeln nicht indirekt brechen
- keine DB/Secrets überschreiben oder committen
- Sound-System bleibt Master, solange keine explizite Migration freigegeben ist
- Dashboard nur über Backend-APIs
- Syntaxcheck und Live-/API-Test passend zum betroffenen Modul

## Nächste sinnvolle Arbeit nach Doku-Cleanup

- Offene SoundBus-Semantik `sound.finished` klären
- Targets/Capabilities für produktive Consumer planen
- Sound-Dashboard Settings UI Teil 2 weiterführen
- Discord-Ausgabe über Sound-System sauber planen
- Sound-Bibliothek/Sound-Dateien DB-/Dashboard-basiert verwalten
