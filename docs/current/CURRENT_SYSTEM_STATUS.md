# CURRENT_SYSTEM_STATUS – Sound-System EventBus Baseline

Stand: STEP412 vorbereitet.

## Aktueller Architektur-Stand

Das Projekt wird kontrolliert in Richtung Communication Bus migriert.

Wichtig: Das Sound-System bleibt die zentrale Audio-/Medien-Schicht. Bestehende Module dürfen weiterhin die alten Sound-System-APIs und WebSocket-Events nutzen.

## STEP412 – Sound-System Bus Baseline

`backend/modules/sound_system.js` wurde auf Version `0.1.13` vorbereitet.

Das Sound-System sendet jetzt parallel zum bestehenden Legacy-Flow `sound.*` Events an den Communication Bus.

Der alte Flow bleibt unverändert:

```text
/api/sound/*
→ Sound-System Queue/Prioritäten/Playback
→ alter sound_system WebSocket
→ bestehende Overlays/Module
```

Zusätzlich:

```text
Sound-System Runtime-Ereignisse
→ Communication Bus
→ channel: sound
→ actions z. B. test, state.updated, queued, started, finished, queue.updated
```

## Neue Sound EventBus Status-/Test-Routen

```text
/api/sound/eventbus/status
/api/sound/eventbus/test
/api/sound/eventbus/reset
```

Die Test-Route erzeugt ein test-only Bus-Event. Sie startet keinen Sound, verändert keine Queue und berührt keinen Playback-Flow.

## Versionierte Runtime-Ausgabe

Sound-Bus-Status nutzt jetzt Versions-/Capability-Felder statt STEP-Felder:

```text
version: 0.1.13
capability: sound.event_output
statusApiVersion: 1.0.0
busMode: legacy_parallel
deliveryClassification: legacy_parallel_event_stream
soundSystemRole: central_audio_media_layer
```

## Unverändert

- Alte `/api/sound/*` Routen bleiben aktiv.
- Alter `sound_system` WebSocket bleibt aktiv.
- Queue-Logik bleibt unverändert.
- Prioritäten bleiben unverändert.
- Bundle-/Lock-Logik bleibt unverändert.
- Alert-TTS-Kopplung bleibt unverändert.
- VIP-/Mod-Sound-Flow bleibt unverändert.
- Keine DB-Migration.
- Keine Overlay-Designänderung.

## Bezug zu Alert/VIP

Alert-System und VIP-System sollen weiterhin das Sound-System als Audio-/Medien-Schicht nutzen. Die Bus-Migration soll zuerst beobachtbar und parallel laufen, bevor produktive Steuerung über Bus eingeführt wird.
