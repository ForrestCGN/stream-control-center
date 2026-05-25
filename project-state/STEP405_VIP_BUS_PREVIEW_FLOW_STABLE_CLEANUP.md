# STEP405 – VIP Bus Preview Flow Stable Cleanup / Produktivpfad-Entscheidung

Stand: 2026-05-25

## Status

Doku-/Entscheidungs-STEP. Keine Codeänderung.

## Ziel

Der gültige VIP-/Communication-Bus-Stand aus STEP399, STEP401, STEP403A und STEP404C wird als aktueller Projektstand eingeordnet. Gleichzeitig wird festgelegt, wie der VIP-Overlay-Pfad vorerst weiterbehandelt wird.

## Geprüfte Grundlage

Relevante Dateien aus GitHub/dev:

```text
backend/modules/communication_bus.js
backend/modules/vip_sound_overlay.js
htdocs/overlays/vip_sound_overlay_v2.html
project-state/STEP404C_VIP_PREVIEW_STABLE_CHECK_RESULT_WRAPPER_FIX.md
```

## Ergebnis der Prüfung

### Produktiver VIP-/Mod-Sound-Pfad bleibt unverändert

Der echte produktive Ablauf bleibt:

```text
Streamer.bot / Dashboard / API
→ /api/vip-sound/command oder /api/vip-sound/enqueue
→ backend/modules/vip_sound_overlay.js
→ /api/sound/play
→ Sound-System spielt VIP-/Mod-Sound
→ VIP-Overlay reagiert auf sound_system WebSocket + /api/sound/status
→ Overlay zeigt passende Karte
```

Dieser Pfad wird in STEP405 nicht verändert.

### Bus-Preview-Pfad bleibt Preview-only

Der zusätzliche Communication-Bus-Pfad bleibt aktuell bewusst nur Preview/Test:

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

Die Route `/api/communication/test-vip-overlay-preview` bleibt Diagnose-/Preview-Route.

### Shadow-/Preview-Trennung bleibt gültig

- `vip.overlay.test` bleibt Shadow-only.
- `vip.overlay.show` zeigt eine Preview-Testkarte.
- `vip.overlay.hide` blendet Preview aus.
- `vip.overlay.update` aktualisiert eine sichtbare Preview.
- Alle Bus-Events senden ACKs.
- Der Sound-System-Pfad bleibt davon getrennt.

## Entscheidung für den nächsten Stand

Für den Moment gilt Option B:

```text
VIP läuft produktiv weiterhin über Sound-System.
Communication-Bus bleibt zusätzlich als stabiler Preview-/Diagnosepfad aktiv.
Echte VIP-/Mod-Events bekommen noch keinen produktiven vip.overlay Event.
```

## Warum keine Codeänderung in STEP405

Eine direkte produktive Umstellung auf `vip.overlay.*` wäre aktuell unnötig riskant, weil:

- das Sound-System bereits der stabile produktive Auslöser ist,
- das VIP-Overlay produktiv korrekt auf Sound-System-Events reagiert,
- der Bus-Pfad bisher als Preview/Shadow getestet wurde,
- eine echte Produktivumschaltung vorher einen eigenen Audit für Queue, Sound-Dauer, Hide-Verhalten, Dedupe und Reconnect braucht.

## Bewusst nicht geändert

- Keine Änderung an `backend/modules/vip_sound_overlay.js`.
- Keine Änderung an `htdocs/overlays/vip_sound_overlay_v2.html`.
- Keine Änderung an `backend/modules/communication_bus.js`.
- Keine Sound-System-/Queue-/Bundle-Änderung.
- Keine DB-Migration.
- Keine neue Route.
- Keine Entfernung alter Diagnose-Routen.
- Keine Änderung an `/api/vip-sound`.
- `/api/vip` bleibt weiterhin absichtlich nicht registriert.

## Gültige STEP-Basis

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

Diese Stände sind nur Fehlerhistorie.

## Nächster sinnvoller Schritt

`STEP406 – VIP Productive Bus Event Audit`

Ziel:

- echten VIP-/Mod-Produktivpfad auditiert betrachten,
- klären, ob zusätzlich zu Sound-System-Events ein produktiver `vip.overlay.*` Event sinnvoll ist,
- keine Änderung an Queue/Sound-System ohne eigenen Audit,
- entscheiden, ob ein echter dualer Pfad `sound_system + vip.overlay` gebaut werden soll,
- erst danach Code anfassen.

## Minimaltests nach Entpacken

Da STEP405 nur Doku aktualisiert, reicht:

```cmd
cd D:\Git\stream-control-center
git status --short
```

Optional bei laufendem Backend:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
```
