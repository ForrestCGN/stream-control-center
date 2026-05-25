# CURRENT_STATUS – STEP405 VIP BUS PREVIEW FLOW STABLE CLEANUP

Stand: 2026-05-25

## Aktueller stabiler Stand

Der aktuelle Projektstand wurde nach dem VIP-/Communication-Bus-Block eingeordnet.

Wichtigster Punkt:

```text
VIP-/Mod-Sounds bleiben produktiv über das bestehende Sound-System aktiv.
Der Communication-Bus-Pfad für VIP ist zusätzlich stabil als Preview-/Diagnosepfad vorhanden.
```

## Bestätigte VIP-/Communication-STEPS

Gültig/PASS:

```text
STEP399  – VIP Overlay Bus Shadow Registration
STEP401  – VIP Overlay Event Shadow Test
STEP403A – VIP Overlay Preview Visible Wait Test
STEP404C – VIP Preview Show/Hide Stable Check Result-Wrapper Fix
```

Nicht als technische Wahrheit verwenden:

```text
STEP404
STEP404A
STEP404B
```

Diese Zwischenstände enthalten Diagnose-/Script-Fehler und sind nur Fehlerhistorie.

## Aktueller VIP-Produktivpfad

```text
Streamer.bot / Dashboard / API
→ /api/vip-sound/command oder /api/vip-sound/enqueue
→ vip_sound_overlay.js
→ Sound-System /api/sound/play
→ Sound-System spielt VIP-/Mod-Sound
→ VIP-Overlay reagiert auf sound_system WebSocket + /api/sound/status
→ Overlay zeigt passende Karte
```

## Aktueller VIP-Bus-Preview-Pfad

```text
Communication Bus
→ vip.overlay.show
→ vip_sound_overlay_v2 zeigt Preview-Testkarte
→ Overlay sendet Ack
→ vip.overlay.hide
→ Overlay blendet aus
→ Overlay sendet Ack
→ Sound-System bleibt unberührt
```

## Entscheidung STEP405

Für den Moment gilt:

```text
Produktivpfad: Sound-System
Zusatzpfad: Communication-Bus Preview/Diagnose
Kein produktiver vip.overlay Event für echte VIP-/Mod-Sounds in STEP405
```

## Nicht geändert in STEP405

- Keine Codeänderung.
- Keine Sound-System-/Queue-/Bundle-Änderung.
- Keine DB-Migration.
- Keine Dashboard-Änderung.
- Keine Änderung an `/api/vip-sound`.
- Keine Registrierung von `/api/vip`.
- Keine Entfernung von Preview-/Diagnose-Routen.

## Nächster sinnvoller Schritt

`STEP406 – VIP Productive Bus Event Audit`

Erst prüfen, dann entscheiden:

- Soll ein echter VIP-/Mod-Produktivevent zusätzlich über `vip.overlay.*` laufen?
- Bleibt das Overlay produktiv ausschließlich Sound-System-getrieben?
- Welche Dedupe-/Hide-/Reconnect-/Queue-Regeln wären bei einem dualen Pfad nötig?
