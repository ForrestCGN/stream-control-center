# STEP399 – VIP Overlay Bus Shadow Registration

## Ausgangslage

STEP398 hat bestätigt:

- `vip_sound_overlay` läuft als Modul `1.8.7`.
- Das VIP-Overlay ist unter `/overlays/vip_sound_overlay_v2.html` erreichbar.
- Das VIP-System nutzt bereits das Sound-System.
- Das VIP-Overlay reagiert auf `op = sound_system` WebSocket Events und pollt `/api/sound/status`.
- Es gab erwartungsgemäß noch keinen VIP-Client im Communication-Bus.

## Änderung

`vip_sound_overlay_v2.html` sendet beim WebSocket-Open zusätzlich ein `bus_hello`:

```json
{
  "type": "bus_hello",
  "clientId": "vip_sound_overlay_v2",
  "clientType": "overlay",
  "module": "vip_sound_overlay",
  "mode": "shadow",
  "capabilities": ["vip.overlay.show", "vip.overlay.hide", "vip.overlay.update", "ack"],
  "version": "STEP399"
}
```

## Nicht geändert

- Kein Sound-System-Umbau.
- Kein neuer produktiver VIP-Eventkanal.
- Keine Änderung an Streamer.bot.
- Keine Änderung an der VIP-Queue-/Sound-Logik.
- Das Overlay zeigt weiterhin auf Basis der bestehenden Sound-System-Events.

## Ziel

Monitoring und spätere Event-Bus-Anbindung vorbereiten, ohne die bestehende Funktionalität zu riskieren.
