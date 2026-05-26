# STEP289 – Sound-System Bus Event Mirror / Native Status Output

Datum: 2026-05-24T13:45:00Z

## Ziel

Das Sound-System soll als zentrale Audio-/Medien-Schicht erhalten bleiben und zusätzlich strukturierte Communication-Bus-Events ausgeben können.

Der Bus ist in STEP289 nur ein zusätzlicher Event-/Status-Ausgang. Er ersetzt keine Sound-API und startet keine Sounds an Queue/Bundles vorbei.

## Geänderte Datei

- `backend/modules/sound_system.js`

## Technische Änderungen

### Modulstand

- `MODULE_STEP = 289`
- `/api/sound/status` enthält `step = 289`.

### Neuer Config-Block

Neuer Default-Block:

```js
soundBus: {
  enabled: false,
  channel: "sound",
  requireAck: false,
  replayable: false,
  ttlMs: 30000,
  targetType: "all",
  targetId: "*",
  includeState: true,
  includeItem: true,
  actions: { ... }
}
```

Der sichere Default ist bewusst `enabled: false`.

### DB-/Dashboard-Settings

`soundBus` wurde in `SOUND_SETTINGS_BLOCKS` aufgenommen. Dadurch kann der Block über `/api/sound/settings` gespeichert und überschrieben werden.

### Neuer Statusblock

`/api/sound/status` enthält jetzt:

```json
{
  "soundBus": {
    "enabled": false,
    "channel": "sound",
    "communicationBusAvailable": true,
    "stats": {
      "emitted": 0,
      "skipped": 0,
      "errors": 0,
      "lastReason": "",
      "lastAction": "",
      "lastEventId": "",
      "lastError": ""
    }
  }
}
```

### Vorbereitete Events

Der Channel ist standardmäßig `sound`. Die Actions sind:

- `state.updated`
- `queue.updated`
- `queued`
- `starting`
- `started`
- `finished`
- `failed`
- `stopped`
- `skipped`
- `cleared`
- `paused`
- `resumed`
- `bundle.queued`
- `bundle.lock_started`
- `bundle.lock_finished`
- `device.started`
- `device.finished`
- `device.failed`
- `discord.started`
- `discord.queued`
- `discord.failed`
- `client.ready`
- `client.audio_started`
- `client.audio_ended`
- `client.error`

Damit erscheinen Bus-Ereignisse als z.B. `sound.started`, `sound.queue.updated` oder `sound.bundle.queued`.

## Bewusst nicht geändert

- keine Änderung an `/api/sound/play`
- keine Änderung an `/api/sound/bundle`
- keine Änderung an `/api/sound/play-media`
- kein neuer Bus-Input `sound.play`
- keine Caller-Module umgebaut
- keine Queue-Sortierung verändert
- kein `activeBundleLock`-Umbau
- keine Dedupe-/Cooldown-Änderung
- keine Interrupt-Regel-Änderung
- bestehender WebSocket `op: sound_system` bleibt erhalten
- keine Funktionalität entfernt

## Erwarteter Testablauf

### 1. Sicherer Default

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" |
  Select-Object step, soundBus
```

Erwartung:

- `step = 289`
- `soundBus.enabled = false`
- `soundBus.communicationBusAvailable = true`

### 2. Test-Ping ohne Bus

Test-Ping muss unverändert funktionieren. Der Bus darf im Default nichts am Sound-Verhalten ändern.

### 3. SoundBus aktivieren

```powershell
$body = @{
  settings = @{
    soundBus = @{
      enabled = $true
    }
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8080/api/sound/settings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 4. Test-Ping mit Bus

Nach Test-Ping:

- `soundBus.stats.emitted` steigt.
- `soundBus.stats.errors = 0`.
- `soundBus.stats.lastAction` zeigt ein Sound-Event.

### 5. Alert-Bundle-Test

Alert-Hauptsound + Alert-TTS müssen weiterhin zusammenbleiben.

### 6. Zurück auf sicher

```powershell
$body = @{
  settings = @{
    soundBus = @{
      enabled = $false
    }
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8080/api/sound/settings" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## Ergebnis

STEP289 bereitet das Sound-System busfähig vor, ohne die bestehende produktive Sound-Logik zu verändern. Der nächste sinnvolle Schritt ist ein Live-Test und danach die Erweiterung der Debug View/Dashboard-Anzeige für Sound-Bus-Events.
