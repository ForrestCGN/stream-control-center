# STEP288 – Sound-System Bus Audit & Migrationsplan

Datum: 2026-05-24T13:40:00Z
Status: Analyse-/Architekturstand ohne Codeänderung

## Ergebnis

Das Sound-System wurde als nächster großer Migrationsblock analysiert. Es ist die zentrale Audio-/Medien-Schicht für Alerts, Alert-TTS, normales TTS, VIP-/Mod-Sounds, SoundAlerts, Birthday-Shows, Clip-Shoutouts, Media-Playback und Discord-Routing.

Der richtige nächste Code-Step ist nicht die sofortige Modul-Migration, sondern ein additiver Bus-Event-Output im Sound-System.

## Kernaussage

Das Sound-System bleibt Master für:

- Queue
- Prioritäten
- Bundles
- `activeBundleLock`
- Overlay-/Device-/Discord-Ausgabe
- Client-ACKs
- Dedupe/Cooldowns
- Level-/Pegel-Korrektur

Der Communication Bus soll zunächst nur Ereignisse spiegeln und Diagnose/Dashboard ermöglichen.

## Geprüfte Nutzer

- Alerts: `/api/sound/bundle`, Hauptsound + Alert-TTS, Start-/Status-Sync.
- TTS: `/api/sound/play`, `/api/sound/status`, Done-Modus `sound_system_status`.
- VIP/Mod: `/api/sound/play`, requestId-Tracking.
- SoundAlerts: `/api/sound/play`, eigene Mapping-/Uploadlogik.
- Birthday: `/api/sound/play`, `/api/sound/bundle`, `/api/sound/status`, `/api/sound/stop`.
- Clip-Shoutout: `/api/sound/bundle`.
- Media/Commands: `/api/sound/play-media` als Media-Registry-Bridge.
- Discord: internes Ausgabeziel über `discordBridge.enqueueSound`.

Keine direkte `/api/sound`-Nutzung gefunden in den geprüften Dateien:

- `challenge.js`
- `clips.js`
- `deathcounter_v2.js`

## Nicht ändern

- Keine Entfernung alter Sound-API-Routen.
- Kein Entfernen des alten WebSocket-Statuswegs `op: sound_system`.
- Keine Änderung an Queue-Sortierung.
- Keine Änderung an `activeBundleLock`.
- Keine Änderung an Dedupe/Cooldowns.
- Keine Änderung an Alert-Bundle-Logik.
- Keine Änderung an Sound/TTS/VIP/SoundAlerts-Caller-Logik.
- Keine DB-Migration in STEP288.

## Empfohlener STEP289

**STEP289 – Sound-System Bus Event Mirror / Native Status Output**

Ziel:

- `sound_system.js` sendet zusätzlich zum bestehenden WebSocket-Status strukturierte Bus-Events.
- Der bestehende Normalbetrieb bleibt unverändert.
- Module spielen weiterhin über `/api/sound/play`, `/api/sound/bundle` oder `/api/sound/play-media`.
- Der Bus ist zunächst Beobachtungs-/Diagnose-Schicht.

Vorgeschlagene Config:

```js
soundBus: {
  enabled: false,
  channel: 'sound',
  requireAck: false,
  replayable: true,
  ttlMs: 60000,
  targetType: 'all',
  targetId: '*',
  targetModule: '',
  targetCapability: ''
}
```

Wichtige Events:

- `sound.queued`
- `sound.starting`
- `sound.started`
- `sound.finished`
- `sound.failed`
- `sound.stopped`
- `sound.skipped`
- `sound.cleared`
- `sound.paused`
- `sound.resumed`
- `sound.queue.updated`
- `sound.bundle.queued`
- `sound.bundle.lock_started`
- `sound.bundle.lock_finished`
- `sound.device.started/finished/failed`
- `sound.discord.queued/failed`
- `sound.client.ready/audio_started/audio_ended/error`

## Nächste Tests nach STEP289

1. Standard mit `soundBus.enabled = false`: Sound-System unverändert.
2. `soundBus.enabled = true`: Test-Ping erzeugt Bus-Events.
3. Alert-Bundle-Test: Hauptsound + TTS bleiben zusammen.
4. V5-Real-Mod-Test erneut durchführen.
5. Danach VIP/SoundAlerts/TTS/Birthday einzeln prüfen.
