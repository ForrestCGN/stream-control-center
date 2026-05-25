# CURRENT_STATUS – STEP407 VIP PRODUCTIVE BUS MIRROR DESIGN

Stand: 2026-05-25

Aktueller stabiler Stand:

- VIP-/Mod-Sound-System bleibt produktiv Sound-System-geführt.
- VIP-Overlay ist zusätzlich als Communication-Bus-Client registriert.
- Bus-Preview-Flow für `vip.overlay.show/hide/update` ist stabil, bleibt aber Preview-/Diagnosepfad.
- STEP406 hat bestätigt: kein produktives `vip.overlay.show` für echte VIP-/Mod-Sounds.
- STEP407 legt den Designvertrag für einen späteren optionalen produktiven Bus-Mirror fest.

Architekturentscheidung:

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

Späterer Mirror:
VIP-Modul
→ Communication Bus
→ vip.sound.* Mirror-Events
→ Diagnose/Logging/Dashboard/Observer
→ keine automatische Overlay-Anzeige
```

Bewertung:

- Für spätere produktive Mirror-Events wird `vip.sound.*` empfohlen, nicht `vip.overlay.*`.
- Mirror-Events sollen `mirrorOnly: true` und `doNotDisplay: true` tragen.
- Sound-System bleibt führend für Queue, Playback und Timing.
- Späterer Mirror darf bei Fehlern niemals VIP-Commands oder Sound-Playback brechen.

Nicht geändert in STEP407:

- Kein Backend-Code.
- Kein Overlay-Code.
- Keine DB-Migration.
- Keine Queue-/Sound-System-Änderung.
- Kein Dashboard.
- Keine Entfernung bestehender Routen.
