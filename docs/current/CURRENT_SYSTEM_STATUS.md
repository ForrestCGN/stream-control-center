# CURRENT SYSTEM STATUS – STEP405 VIP BUS PREVIEW FLOW STABLE CLEANUP

Stand: 2026-05-25

## Aktueller Fokus

Der VIP-/Communication-Bus-Stand aus STEP404C wurde als aktueller stabiler Zusatzstand eingeordnet.

Die zentrale Entscheidung:

```text
VIP-/Mod-Sounds bleiben produktiv über das Sound-System.
Communication Bus bleibt für VIP zusätzlich als Preview-/Diagnosepfad aktiv.
```

## Bestätigter Gesamtstand

- GitHub/dev enthält den gültigen VIP-/Communication-Bus-Stand.
- `vip_sound_overlay_v2` ist als Communication-Bus-Client registriert.
- Der Client läuft als Overlay im Modus `shadow`.
- Capabilities:
  - `vip.overlay.test`
  - `vip.overlay.show`
  - `vip.overlay.hide`
  - `vip.overlay.update`
  - `ack`
- `vip.overlay.test` bleibt Shadow-only.
- `vip.overlay.show` zeigt eine Preview-Testkarte.
- `vip.overlay.hide` blendet die Preview aus.
- `vip.overlay.update` aktualisiert eine sichtbare Preview.
- ACKs werden vom Overlay an den Communication Bus gesendet.
- Sound-System bleibt im Preview-Test unberührt.

## Produktiver VIP-/Mod-Sound-Pfad

```text
Streamer.bot / Dashboard / API
→ /api/vip-sound/command oder /api/vip-sound/enqueue
→ backend/modules/vip_sound_overlay.js
→ /api/sound/play
→ Sound-System
→ VIP-Overlay über sound_system WebSocket + /api/sound/status
```

Dieser Pfad ist weiterhin der produktive Standard.

## VIP-Bus-Preview-Pfad

```text
/api/communication/test-vip-overlay-preview?action=show|hide|update
→ Communication Bus
→ vip.overlay.*
→ vip_sound_overlay_v2.html
→ ACK
```

Dieser Pfad bleibt Diagnose/Preview und wird noch nicht für echte produktive VIP-/Mod-Sounds verwendet.

## Wichtige Architekturentscheidung

STEP405 entscheidet ausdrücklich gegen eine vorschnelle Produktivumschaltung.

Aktueller Modus:

```text
Sound-System = produktiver Auslöser
Communication Bus = stabiler Preview-/Diagnosepfad
```

Ein echter produktiver `vip.overlay.*`-Pfad für VIP-/Mod-Sounds wird frühestens nach einem eigenen Audit gebaut.

## Relevante Dateien

```text
backend/modules/communication_bus.js
backend/modules/vip_sound_overlay.js
htdocs/overlays/vip_sound_overlay_v2.html
project-state/STEP404C_VIP_PREVIEW_STABLE_CHECK_RESULT_WRAPPER_FIX.md
project-state/STEP405_VIP_BUS_PREVIEW_FLOW_STABLE_CLEANUP.md
```

## Nicht geändert

- Keine Sound-System-Logik.
- Keine Queue-Logik.
- Keine Bundle-/Lock-Logik.
- Keine DB-Migration.
- Keine Dashboard-Arbeit.
- Keine Entfernung von Legacy-/Diagnose-/Preview-Pfaden.
- Keine neue `/api/vip`-Route.

## Nächster sinnvoller Block

Empfohlen:

```text
STEP406 – VIP Productive Bus Event Audit
```

Ziel:

- realen VIP-/Mod-Produktivpfad vollständig prüfen,
- entscheiden, ob echte VIP-/Mod-Events zusätzlich einen `vip.overlay.*` Event bekommen sollen,
- Dedupe, Hide-Verhalten, Reconnect, Sound-Dauer und Queue-Verhalten vor Codeänderungen klären.
