# STEP369_ALERT_OUTPUT_BUS_CONTRACT_AUDIT

Status: Audit / Dokumentation
Datum: 2026-05-24
Codeänderungen: nein

## Ziel

Vor einer späteren Migration der Alert-Ausgabe von `legacy` Richtung Communication-Bus wurde der tatsächliche aktuelle Vertrag geprüft und dokumentiert:

- Backend Alert-System Output-Modi
- Legacy WebSocket-Overlay-Vertrag
- Communication-Bus Event-Envelope
- Ack-/Finished-Verhalten
- Reconnect-/Recovery-Verhalten nach STEP365
- Risiken vor einer späteren `bus`-Umstellung

## Geprüfte Dateien

- `backend/modules/alert_system.js`
- `htdocs/overlays/_overlay-alerts-v2.html`
- `backend/modules/communication_bus.js`
- `backend/modules/helpers/helper_communication.js`

## Aktueller Stand

### Alert-System

Aktueller Repo-Stand enthält:

- `MODULE_STEP = 365`
- `alertOutput.mode = legacy`
- vorbereitete Bus-Konfiguration unter `alertOutput.bus`
- optionaler `communicationBusMirror`, runtime default aber deaktiviert
- Overlay-Watchdog + Recovery-Status
- Reconnect-Recovery mit Restlaufzeit aus STEP365

Damit ist `legacy` aktuell weiterhin der produktive Ausgabeweg.

### Legacy Overlay-Vertrag

Das echte Alert-Overlay `_overlay-alerts-v2.html` erwartet WebSocket-Nachrichten mit:

```json
{
  "op": "alert_system",
  "event": "play",
  "alert": { }
}
```

und für Clear:

```json
{
  "op": "alert_system",
  "event": "clear"
}
```

Das Overlay meldet sich beim Öffnen/Reconnect mit:

```json
{
  "op": "alert_system",
  "client": "overlay",
  "event": "hello"
}
```

Nach Ablauf sendet es:

```json
{
  "op": "alert_system",
  "client": "overlay",
  "event": "finished",
  "alertId": "...",
  "reason": "finished"
}
```

Aktuell gibt es im Legacy-Overlay keinen separaten `ack` direkt beim Empfang/Renderstart. Der Abschluss erfolgt über `finished`.

### Communication-Bus-Vertrag

Der zentrale Bus arbeitet mit einem Envelope:

```json
{
  "bus": "cgn",
  "version": 1,
  "id": "evt_...",
  "type": "event",
  "channel": "visual.alert",
  "action": "play",
  "source": { "type": "module", "id": "alert_system", "module": "alert_system" },
  "target": { "type": "all", "id": "*", "module": "", "capability": "" },
  "timestamp": "...",
  "payload": { },
  "meta": {
    "requireAck": true,
    "replayable": true,
    "ttlMs": 60000
  }
}
```

Clients können sich am Bus per WebSocket registrieren (`hello` / `bus_hello` / `communication_hello`) und Acks senden (`ack` / `bus_ack` / `communication_ack`).

## Wichtigste Erkenntnisse

### 1. Legacy und Bus sind aktuell unterschiedliche Protokolle

Legacy sendet direkt:

```json
{ "op": "alert_system", "event": "play", "alert": { ... } }
```

Bus sendet Envelope:

```json
{ "bus": "cgn", "channel": "visual.alert", "action": "play", "payload": { ... } }
```

Ein Overlay kann nicht automatisch beides verstehen, solange kein Adapter vorhanden ist.

### 2. `requireAck=true` ist für Bus vorbereitet, aber das aktuelle Legacy-Overlay sendet keinen Bus-Ack

Das Legacy-Overlay sendet nur `finished` im `alert_system`-Protokoll. Für echten Bus-Betrieb müsste ein Bus-Overlay oder Adapter `ack(eventId, clientId, status)` senden.

Empfohlene Ack-Stufen für später:

- `received` direkt nach Empfang
- `rendered` nach sichtbarem Renderstart
- `finished` nach Ablauf
- `error` bei Render-/Payloadfehler

### 3. Reconnect-Recovery ist aktuell legacy-spezifisch gelöst

STEP365 sendet bei `overlay_reconnect_hello` den laufenden Alert erneut direkt an genau diesen WebSocket-Client und passt `durationMs` auf die Restlaufzeit an. Das ist für Legacy korrekt.

Für Bus-Betrieb sollte dieses Verhalten nicht 1:1 als neuer `play`-Vollalert mit voller Dauer umgesetzt werden, sondern als Replay/Recovery mit Restlaufzeit.

### 4. SoundBus und Alert VisualBus müssen getrennt bleiben

SoundBus ist aktuell stabil für Audio/Video-Playback und Client-Events.

Alert-VisualBus darf später nur die visuelle Alert-Anzeige steuern und nicht automatisch Sound/TTS neu starten.

## Vorgeschlagener Zielvertrag für spätere Bus-Migration

### Kanal

```text
visual.alert
```

### Actions

```text
play
clear
recover
status
```

### Payload für `play`

```json
{
  "alert": {
    "id": "al_...",
    "source": "twitch",
    "type": "bits",
    "durationMs": 12000,
    "headline": "...",
    "value": "...",
    "message": "...",
    "avatarUrl": "...",
    "display": { "settings": { } },
    "soundSystem": {
      "handledBySoundSystem": true,
      "requestId": "snd_...",
      "bundleId": "..."
    }
  },
  "timing": {
    "startedAt": "2026-05-24T...Z",
    "durationMs": 12000,
    "remainingMs": 8200,
    "expectedEndsAt": "2026-05-24T...Z",
    "recovery": false
  },
  "correlation": {
    "alertEventUid": "al_...",
    "soundRequestId": "snd_...",
    "bundleId": "..."
  }
}
```

### Payload für `recover`

```json
{
  "alertEventUid": "al_...",
  "reason": "overlay_reconnect_hello",
  "remainingMs": 8200,
  "originalDurationMs": 23210,
  "elapsedMs": 15010,
  "soundChanged": false,
  "ttsChanged": false,
  "queueChanged": false
}
```

## Risiken vor einer Bus-Umstellung

1. Das aktuelle Overlay versteht noch keinen Bus-Envelope.
2. Bus-Ack ist vorhanden, aber im Alert-Overlay noch nicht implementiert.
3. Reconnect-Recovery muss Restlaufzeit übernehmen, sonst wiederholt sich der STEP365-Fehler.
4. Sound/TTS darf durch visuelle Replay-/Recover-Events nicht neu ausgelöst werden.
5. `legacy` darf erst entfernt werden, wenn Bus-Overlay/Adapter produktiv getestet wurde.

## Empfehlung für nächsten Schritt

STEP370 sollte kein großer Moduswechsel sein, sondern ein kleiner Adapter-/Diagnoseschritt:

`STEP370_ALERT_BUS_ADAPTER_DRY_RUN`

Ziel:

- Bus-Payload zusätzlich erzeugen und prüfen
- nicht produktiv an Overlay ausliefern
- Legacy bleibt aktiv
- prüfen, ob Payload vollständig genug ist
- optional Debug-Route oder Log-Ausgabe für den Zielvertrag

Nicht empfohlen als nächster Schritt:

- sofort `alertOutput.mode = bus`
- Legacy entfernen
- Overlay komplett ersetzen
- Dashboard-Umbau

## Abschluss

STEP369 ist ein Audit-/Vertragsschritt. Es wurden keine Dateien der Laufzeit geändert.
