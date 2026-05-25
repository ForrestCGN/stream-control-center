# CURRENT SYSTEM STATUS – STEP407 VIP PRODUCTIVE BUS MIRROR DESIGN

Stand: 2026-05-25

## Aktueller Fokus

VIP-/Mod-Sound-System wurde nach STEP406 weiter eingeordnet. STEP407 legt den Designvertrag für einen späteren optionalen produktiven VIP-/Mod-Bus-Mirror fest. Es gab keine Codeänderung.

## Aktueller stabiler VIP-/Mod-Stand

- VIP-/Mod-System läuft produktiv weiterhin über das Sound-System.
- Canonical API-Prefix bleibt `/api/vip-sound`.
- Alias `/api/vip-sound-overlay` bleibt vorhanden.
- `/api/vip` ist absichtlich nicht registriert.
- VIP-Overlay-Datei bleibt `htdocs/overlays/vip_sound_overlay_v2.html`.
- VIP-Backend-Modul bleibt `backend/modules/vip_sound_overlay.js`.
- VIP-Overlay ist zusätzlich als Communication-Bus-Client registriert.
- Bus-Preview-Flow für `vip.overlay.show/hide/update` ist stabil, bleibt aber Preview-/Diagnosepfad.

## Produktiver Flow

```text
Streamer.bot / Dashboard / API
→ /api/vip-sound/command oder /api/vip-sound/enqueue
→ backend/modules/vip_sound_overlay.js
→ /api/sound/play
→ Sound-System steuert Queue, Ausgabe und Playback
→ VIP-Overlay reagiert auf sound_system WebSocket + /api/sound/status
→ Overlay zeigt passende Karte
```

## Communication-Bus Preview Flow

```text
Communication Bus
→ vip.overlay.show / vip.overlay.hide / vip.overlay.update
→ vip_sound_overlay_v2 zeigt Preview-Testkarte
→ Overlay sendet Ack
→ Sound-System bleibt unberührt
```

## STEP407-Entscheidung

Für spätere produktive Mirror-Events wird `vip.sound.*` empfohlen, nicht `vip.overlay.*`.

Begründung:

- `vip.overlay.*` beschreibt direkte Anzeige-Aktionen.
- `vip.sound.*` beschreibt fachliche VIP-/Mod-Sound-Ereignisse.
- Das verhindert, dass echte VIP-/Mod-Sounds doppelt angezeigt werden.
- Sound-System bleibt die Timing-Wahrheit für Queue, Playback und Overlay-Anzeige.

## Vorgeschlagener späterer Mirror-Bereich

```text
vip.sound.requested
vip.sound.rejected
vip.sound.accepted
vip.sound.queued
vip.sound.duplicate
vip.sound.override.denied
vip.sound.override.accepted
vip.sound.sound_missing
vip.sound.system_disabled
vip.sound.failed
```

Später mit SoundBus-Korrelation zusätzlich möglich:

```text
vip.sound.started
vip.sound.finished
vip.sound.client_audio_started
vip.sound.client_audio_ended
```

## Schutzregeln für spätere Mirror-Events

Produktive Mirror-Events müssen mindestens diese Absicht tragen:

```text
mirrorOnly: true
productionEvent: true
productionTarget: false
doNotDisplay: true
```

Das bedeutet: Observer, Debug-Views, Dashboard oder Logs dürfen diese Events nutzen. Ein Overlay darf daraus aber nicht automatisch eine Karte anzeigen.

## Nächster sinnvoller Schritt

Empfohlen: `STEP408 – VIP Productive Bus Mirror Feature Flag`

Ziel:

- Feature-Flag-/Status-Grundlage vorbereiten.
- Mirror standardmäßig deaktiviert lassen.
- Keine Sound-System-/Queue-/Overlay-Änderung.

Alternative, wenn direkt umgesetzt werden soll:

`STEP408 – VIP Productive Bus Mirror Implementation`

Dann nur mit Default `productiveBusMirrorEnabled=false` und ohne Anzeige-Trigger.

## Nicht geändert in STEP407

- Kein Backend-Code.
- Kein Overlay-Code.
- Kein Dashboard.
- Keine DB-Migration.
- Keine Sound-System-Änderung.
- Keine Queue-/Prioritätsänderung.
- Kein produktives `vip.overlay.show` für echte VIP-/Mod-Sounds.
- Keine Entfernung von Legacy-/HTTP-/WebSocket-Pfaden.
