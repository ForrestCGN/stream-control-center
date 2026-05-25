# VIP Event Shadow – Stable Stand STEP402

## Aktueller VIP-Flow

Der produktive VIP-Flow bleibt weiterhin Sound-System-basiert:

```text
/api/vip-sound
→ vip_sound_overlay.js
→ /api/sound/play
→ sound_system events/status
→ vip_sound_overlay_v2.html
```

## Zusätzlich aktiv

Das VIP-Overlay ist zusätzlich am Communication-Bus angemeldet:

```text
clientId: vip_sound_overlay_v2
module: vip_sound_overlay
type: overlay
status: online
mode: shadow
```

## Bestätigte Fähigkeit

Das Overlay kann ein `vip.overlay` Shadow-Testevent empfangen und per `bus_ack` bestätigen.

## Sicherheitsgrenze

Der Bus-Test darf den Sound-System-Flow nicht ersetzen. Bis zu einem späteren expliziten Umschalt-STEP bleibt die sichtbare VIP-Anzeige an den Sound-System-Status gebunden.

## Geeigneter nächster Ausbau

- Event-Kontrakt für `vip.overlay.show`, `vip.overlay.hide`, `vip.overlay.update` definieren.
- Preview-/Shadow-Test für Anzeige bauen.
- Erst nach Live-Tests über Produktionsumschaltung sprechen.
