# STEP406 – VIP EventBus Status Diagnostics

Status: prepared
Date: 2026-05-25

## Ziel

STEP406 macht die in STEP405 ergänzten VIP EventBus-Status-Events sauber prüfbar.

Das VIP-System sendet weiterhin echte VIP-/Mod-Sounds über den bestehenden Sound-System-Pfad. Der EventBus ist in diesem Schritt nur ein zusätzlicher Status-/Diagnosekanal.

## Geänderte Datei

- `backend/modules/vip_sound_overlay.js`

## Neue Diagnose-Routen

Für beide vorhandenen Prefixe:

- `/api/vip-sound/eventbus/status`
- `/api/vip-sound/eventbus/reset`
- `/api/vip-sound-overlay/eventbus/status`
- `/api/vip-sound-overlay/eventbus/reset`

`/eventbus/status` zeigt:

- ob die VIP EventBus-Status-Events aktiv sind
- den verwendeten Channel `vip.sound`
- ob `communication_bus.getBus()` verfügbar ist
- Zähler für gesendete, übersprungene und fehlgeschlagene Events
- das zuletzt gemeldete Event

`/eventbus/reset` setzt ausschließlich Diagnosezähler zurück. Es verändert keine Queue, keine Daily-Usage, keine DB-Daten und keine Overlay-Anzeige.

## Integration-Check

`/api/vip-sound/integration-check` enthält jetzt zusätzlich:

- `eventBus`
- Check `eventbus_status_events`

Wenn der Communication-Bus nicht erreichbar ist, ist das nur eine Warnung. Der bestehende VIP-Sound-Flow bleibt davon unabhängig.

## Nicht geändert

- Keine Änderung am Sound-System
- Keine Änderung an `/api/sound/play`
- Keine Änderung an der Queue
- Keine Änderung an Daily-Usage
- Keine DB-Migration
- Keine Änderung am sichtbaren Overlay
- Kein Bus-only-Modus
- Kein Ersatz des bestehenden produktiven VIP-Sound-Flows

## Test

Nach dem Entpacken:

```cmd
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
```

Nach Backend-Neustart:

```text
http://127.0.0.1:8080/api/vip-sound/eventbus/status
http://127.0.0.1:8080/api/vip-sound/integration-check
```

Optionaler Reset der reinen Diagnosezähler:

```text
http://127.0.0.1:8080/api/vip-sound/eventbus/reset
```

## Ergebnis

Der nächste Test kann jetzt klar zeigen, ob echte VIP-/Mod-Vorgänge zusätzliche Status-Events auf `vip.sound` erzeugen, ohne Sound- oder Overlay-Verhalten zu ändern.
