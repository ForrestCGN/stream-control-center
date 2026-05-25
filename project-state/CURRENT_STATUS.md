# CURRENT_STATUS – STEP406 VIP PRODUCTIVE BUS EVENT AUDIT

Stand: 2026-05-25

Aktueller stabiler Stand:

- VIP-/Mod-Sound-System bleibt produktiv Sound-System-geführt.
- VIP-Overlay ist zusätzlich als Communication-Bus-Client registriert.
- Bus-Preview-Flow für `vip.overlay.show/hide/update` ist stabil, bleibt aber Preview-/Diagnosepfad.
- Keine produktive Bus-Ausgabe für echte VIP-/Mod-Sounds in STEP406.

Bestätigte Architektur:

```text
Produktiv:
/api/vip-sound/command
→ VIP-Modul
→ /api/sound/play
→ Sound-System
→ VIP-Overlay über sound_system WS + /api/sound/status

Preview/Diagnose:
/api/communication/test-vip-overlay-preview
→ Communication Bus
→ vip.overlay.show/hide/update
→ vip_sound_overlay_v2
→ Ack
```

Bewertung:

- Produktive VIP-/Mod-Sounds sollen vorerst nicht über `vip.overlay.show` ausgelöst werden.
- Ein späterer Bus-Mirror ist sinnvoll, aber zuerst als Diagnose-/Status-Mirror, nicht als Anzeige-Trigger.
- Sound-System bleibt die führende Instanz für Queue, Playback und Timing.

Nicht geändert in STEP406:

- Kein Backend-Code.
- Kein Overlay-Code.
- Keine DB-Migration.
- Keine Queue-/Sound-System-Änderung.
- Kein Dashboard.
- Keine Entfernung bestehender Routen.
