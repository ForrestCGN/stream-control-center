# CHANGELOG

## STEP407 – VIP Productive Bus Mirror Design – 2026-05-25

- Eventvertrag für spätere produktive VIP-/Mod-Bus-Mirror-Events entworfen.
- Entscheidung festgehalten: produktive Mirror-Events sollen `vip.sound.*` nutzen, nicht `vip.overlay.*`.
- Schutzmarkierungen dokumentiert: `mirrorOnly: true`, `productionTarget: false`, `doNotDisplay: true`.
- Empfohlene Payload-/Meta-Felder, Feature-Flags, Einbaupunkte und Tests dokumentiert.
- Keine Codeänderungen.
- Keine DB-/Queue-/Sound-/Dashboard-Änderungen.

## STEP406 – VIP Productive Bus Event Audit – 2026-05-25

- VIP-/Mod-Sound-Produktivpfad gegen Communication-Bus-Preview-Pfad auditiert.
- Dokumentiert: Produktive VIP-/Mod-Sounds bleiben über `/api/vip-sound/command` → `/api/sound/play` → Sound-System geführt.
- Dokumentiert: `vip.overlay.show/hide/update` bleibt vorerst Preview-/Diagnosepfad.
- Entscheidung festgehalten: kein produktiver VIP-Bus-Overlay-Ausgabeweg ohne eigenes Dedup-/Timing-/Eventvertrags-STEP.
- Nächster sinnvoller Schritt: `STEP407 – VIP Productive Bus Mirror Design`.
- Keine Codeänderungen.
- Keine DB-/Queue-/Sound-/Dashboard-Änderungen.

## STEP405 – VIP Bus Preview Flow Stable Cleanup – 2026-05-25

- VIP-/Communication-Bus-Stand nach STEP404C als aktueller Zusatzstand dokumentiert.
- Entscheidung dokumentiert: VIP-/Mod-Sounds bleiben produktiv über Sound-System.
- Communication-Bus bleibt für VIP zunächst Preview-/Diagnosepfad.
- Keine Codeänderungen.

## STEP404C – VIP Preview Show/Hide Stable Check Result-Wrapper Fix – 2026-05-25

- Stabiler Check für VIP Preview Show/Hide bestätigt.
- `/api/communication/test-vip-overlay-preview` liefert relevante Daten unter `result.*`.
- Show-/Hide-Acks wurden über `vip_sound_overlay_v2.lastAckAt` geprüft.
- Sound-System blieb unberührt.

## STEP354 – SoundBus Final Check – 2026-05-24

- Sound-System/SoundBus-Abschlussstand dokumentiert.
- Bestätigt: Overlay-Sound über `outputTarget=overlay` erzeugt `item_starting`, `item_started`, `play_stream`, `client.audio_started`, `client_audio_ended` und `item_finished`.
- Bestätigt: Sound-Overlay meldet tatsächlichen Playback-Start und Playback-Ende mit gleicher `requestId` zurück.
- Ergebnis: SoundBus ist bereit, damit danach einzelne Systeme angebunden werden können.
- Keine Codeänderungen in STEP354.
