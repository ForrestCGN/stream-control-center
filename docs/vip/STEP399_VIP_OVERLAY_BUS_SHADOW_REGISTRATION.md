# STEP399 – VIP Overlay Communication-Bus Shadow Client

## Bestehender Overlay-Mechanismus

Das VIP-Overlay bleibt an den Sound-System-Lebenszyklus gekoppelt:

- WebSocket empfängt `op = sound_system`.
- Startgründe wie `started`, `item_started`, `play_stream` zeigen das Overlay.
- Stopgründe wie `finished`, `manual_stop`, `reset` verstecken das Overlay.
- `/api/sound/status` dient als Polling-Fallback.
- VIP-Items werden über `visual.module = vip_sound_overlay` erkannt.

## STEP399-Erweiterung

Beim gleichen WebSocket sendet das Overlay zusätzlich `bus_hello` an den Communication-Bus.

Das ist nur Registrierung/Monitoring. Es wird noch kein `vip.overlay/show` produktiv gerendert.

## Warum Shadow?

Der aktuelle VIP-Flow ist bereits funktionsfähig. Der Bus soll zuerst sichtbar machen:

- Ist das Overlay online?
- Kann der Bus das VIP-Overlay als Client sehen?
- Bleibt der bestehende Sound-System-Flow unangetastet?

Erst danach folgt ein möglicher STEP400 für `vip.overlay` Shadow-Events.
