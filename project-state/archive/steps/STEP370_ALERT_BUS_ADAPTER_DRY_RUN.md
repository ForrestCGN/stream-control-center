# STEP370_ALERT_BUS_ADAPTER_DRY_RUN

Datum: 2026-05-24  
Projekt: stream-control-center  
Status: Planung / Dry-Run-Vertrag  
Codeänderungen: Nein  
Produktivumschaltung: Nein

## Ziel

STEP370 beschreibt den nächsten sicheren Zwischenschritt nach dem STEP369-Audit:

- Legacy-Alert-Ausgabe bleibt produktiv aktiv.
- Es wird noch nicht auf `alertOutput.mode = bus` umgeschaltet.
- Vor einer Bus-Umschaltung braucht es einen Adapter-Vertrag zwischen:
  - `alert_system.js`
  - `_overlay-alerts-v2.html`
  - `communication_bus.js`
  - `helper_communication.js`

## Ausgangslage

Der geprüfte Stand aus `dev` zeigt:

- `alert_system.js` steht auf `MODULE_STEP = 365`.
- Produktiver Modus ist weiterhin `alertOutput.mode = legacy`.
- Das aktive Alert-Overlay versteht Legacy-WebSocket-Nachrichten:
  - `op = "alert_system"`
  - `event = "play"`
  - `event = "clear"`
  - Overlay sendet `event = "finished"` zurück.
- Der zentrale Communication-Bus nutzt dagegen einen eigenen Envelope:
  - `bus`
  - `version`
  - `id`
  - `type`
  - `channel`
  - `action`
  - `source`
  - `target`
  - `timestamp`
  - `payload`
  - `meta`
- Bus-Acks laufen über:
  - `type = "ack"` bzw. `bus_ack`
  - `eventId`
  - `clientId`
  - `status`

## Problem

Ein direkter Wechsel von Legacy auf Bus wäre riskant, weil das aktuelle Overlay nicht nativ auf den Bus-Envelope hört.

Legacy erwartet:

```json
{
  "op": "alert_system",
  "event": "play",
  "alert": {}
}
```

Bus liefert dagegen:

```json
{
  "bus": "cgn",
  "version": 1,
  "id": "evt_...",
  "type": "event",
  "channel": "visual.alert",
  "action": "play",
  "payload": {
    "alert": {}
  },
  "meta": {
    "requireAck": true,
    "replayable": true
  }
}
```

Ohne Adapter würde das Overlay Bus-Nachrichten ignorieren.

## Adapter-Dry-Run-Konzept

STEP370 definiert einen sicheren Adapter-Plan, ohne ihn produktiv zu erzwingen.

### Variante A: Overlay-seitiger Adapter

Das bestehende Overlay bekommt später zusätzlich eine Bus-Nachrichtenverarbeitung:

- Wenn `data.op === "alert_system"`:
  - bestehender Legacy-Pfad bleibt unverändert.
- Wenn `data.channel === "visual.alert"` und `data.action === "play"`:
  - `data.payload.alert` wird an `playAlert()` übergeben.
- Wenn `data.channel === "visual.alert"` und `data.action === "clear"`:
  - `clearAlert()` wird aufgerufen.
- Bei erfolgreicher Annahme sendet das Overlay zusätzlich Bus-Ack:
  - `type = "ack"`
  - `eventId = data.id`
  - `clientId = overlayClientId`
  - `status = "received"` oder `"finished"`

Vorteil:
- Ein Overlay kann Legacy und Bus parallel verstehen.
- Produktivmodus kann später schrittweise umgestellt werden.

Nachteil:
- Overlay-Code muss erweitert werden.

### Variante B: Backend-seitiger Adapter

Das Alert-System könnte Bus-Events intern zusätzlich in Legacy-Payloads übersetzen und an bekannte Alert-Overlay-Clients senden.

Vorteil:
- Overlay müsste kurzfristig nicht geändert werden.

Nachteil:
- Der Bus bleibt nicht wirklich Ende-zu-Ende.
- Ack-/Replay-Vorteile des Bus werden nur teilweise genutzt.

### Empfehlung

Variante A ist langfristig sauberer.

Nächster echter Umsetzungsschritt sollte deshalb sein:

`STEP371_ALERT_OVERLAY_BUS_ADAPTER_SHADOW`

Dabei wird das Overlay so erweitert, dass es Bus-Events versteht, aber `alertOutput.mode = legacy` bleibt. Bus kann dann als Shadow/Mirror geprüft werden, ohne den Live-Pfad zu ersetzen.

## Nicht-Ziele

STEP370 ändert bewusst nichts an:

- Alert-Regeln
- Alert-Assets
- Sound-System
- SoundBus
- TTS
- Queue
- Birthday-System
- VIP-System
- Dashboard
- Datenbank
- OBS-Quellen
- produktiver Alert-Ausgabe

## Offener Known-Issue bleibt getrennt

Der bereits dokumentierte Sound-System-Befund bleibt offen:

- verwaister `activeBundleLock`
- `current = null`
- `currentBundle = null`
- Queue blockiert Birthday-/VIP-Sounds
- Workaround: `POST /api/sound/clear`

Dieser Fehler wird nicht in STEP370 bearbeitet.

## Ergebnis

STEP370 ist ein Vertrags-/Planungsstand.

Freigegebener nächster Schritt:

`STEP371_ALERT_OVERLAY_BUS_ADAPTER_SHADOW`

Ziel:
- Overlay versteht Legacy und Bus parallel.
- Legacy bleibt produktiv.
- Bus-Mirror/Shadow kann gefahrlos getestet werden.
