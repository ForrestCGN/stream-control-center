# STEP404 – VIP Preview Show/Hide Stable Handoff

## Status

**STABLE / PASS bestätigt durch STEP403A**

## Bestätigte Ausgabe aus STEP403A

```text
STEP403A_STATUS=PASS
Preview war sichtbar
Show-Ack = 1
Hide-Ack = 1
Sound-System unberührt
Queue = 0
Watchdog = grün
```

## Was jetzt stabil ist

- `vip_sound_overlay_v2.html` ist als Communication-Bus-Client online.
- `vip.overlay.show` kann an das Overlay zugestellt werden.
- Das Overlay bestätigt Show-Events per Ack.
- Die Preview-Anzeige wird sichtbar dargestellt.
- `vip.overlay.hide` kann an das Overlay zugestellt werden.
- Das Overlay bestätigt Hide-Events per Ack.
- Das Sound-System bleibt bei diesen Preview-Tests unberührt.
- Es entstehen keine Sound-Queue-Einträge.
- Der Communication-Watchdog bleibt ohne Issues.

## Was nicht geändert wurde

- Der produktive VIP-/Mod-Sound-Flow wurde nicht ersetzt.
- Das Sound-System bleibt produktiv führend.
- Streamer.bot-/Dashboard-Trigger werden nicht umgebaut.
- Keine bestehende VIP-Funktionalität wurde entfernt.

## Produktive Architektur nach STEP404

```text
Produktiv:
/api/vip-sound
→ Sound-System
→ sound_system Events + /api/sound/status
→ VIP Overlay sichtbar

Shadow/Preview:
Communication-Bus
→ vip.overlay.show / vip.overlay.hide
→ VIP Overlay Preview/Testanzeige
→ Ack
```

## Nächster Schritt

Empfohlen: STEP405 als Plan-/Shadow-Integration für die Kombination aus produktivem VIP-Sound und optionalem Bus-Visual-Mirror.
