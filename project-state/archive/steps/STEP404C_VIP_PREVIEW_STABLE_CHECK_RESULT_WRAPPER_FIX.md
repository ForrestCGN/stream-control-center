# STEP404C – VIP Preview Show/Hide Stable Check Result-Wrapper Fix

## Status

Script-Fix only.

## Grundlage

Der echte Live-Output zeigte, dass `/api/communication/test-vip-overlay-preview` erfolgreich ist, die Daten aber unter `result.*` liegen. Beispielstruktur:

```json
{
  "ok": true,
  "result": {
    "ok": true,
    "eventId": "...",
    "deliveredTo": ["vip_sound_overlay_v2"],
    "deliveredCount": 1,
    "event": {
      "ackCount": 0
    }
  }
}
```

STEP404B hat `deliveredCount` im Root gelesen und deshalb falsch abgebrochen.

## Fix

`STEP404C_vip_preview_show_hide_stable_check_result_wrapper_fix.ps1`:

- liest Emit-Daten robust aus `result.*` oder Root
- nutzt keine `/api/communication/event` Route
- prüft `vip_sound_overlay_v2` über `/api/communication/status`
- wartet auf Ack-Änderung über `lastAckAt` im VIP-Client
- prüft, dass Sound-System current/queue leer bleiben
- prüft Communication-Watchdog

## Erwarteter Zielzustand

- VIP-Bus-Client online
- Show-Event an `vip_sound_overlay_v2` geliefert
- Show-Ack über `lastAckAt` beobachtet
- Preview sichtbar während Wartezeit
- Hide-Event an `vip_sound_overlay_v2` geliefert
- Hide-Ack über `lastAckAt` beobachtet
- Sound-System bleibt unberührt
- Watchdog bleibt grün
