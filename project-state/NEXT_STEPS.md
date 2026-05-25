# NEXT STEPS – nach STEP405 VIP BUS PREVIEW FLOW STABLE CLEANUP

## Nächster sinnvoller Block

`STEP406 – VIP Productive Bus Event Audit`

## Ziel

Vor jeder echten VIP-Produktivbus-Änderung muss der reale VIP-/Mod-Soundpfad geprüft werden.

## Vor STEP406 prüfen

- Aktuelle `backend/modules/vip_sound_overlay.js` aus GitHub/dev lesen.
- Aktuelle `htdocs/overlays/vip_sound_overlay_v2.html` aus GitHub/dev lesen.
- Aktuelle `backend/modules/sound_system.js` aus GitHub/dev lesen.
- Aktuelle `backend/modules/communication_bus.js` aus GitHub/dev lesen.
- Live-Status prüfen:
  - `/api/vip-sound/status`
  - `/api/sound/status`
  - `/api/communication/status`

## Kernfragen für STEP406

1. Soll das VIP-Overlay bei echten VIP-/Mod-Sounds weiterhin ausschließlich über Sound-System-Events sichtbar werden?
2. Soll zusätzlich ein produktiver `vip.overlay.show/hide` Event gesendet werden?
3. Falls dualer Pfad: Wer ist führend für Hide/Duration?
4. Wie wird doppelte Anzeige verhindert?
5. Wie verhält sich das System bei Reconnect?
6. Wie bleibt die bestehende Sound-System-Queue unberührt?
7. Muss Dashboard-Konfiguration vorbereitet werden oder reicht zunächst ein interner Modus?

## Nicht machen ohne eigenen STEP

- Keine Umstellung auf Bus-only.
- Keine Entfernung des Sound-System-Pfads.
- Keine Änderung an Sound-Queue oder Bundle-Lock.
- Keine DB-Migration.
- Keine neue Dashboard-Seite.
- Keine Produktivroute ohne Audit.

## Optional später

Nach STEP406 kann ein kleiner Code-STEP folgen:

`STEP407 – VIP Productive Bus Dual Event Prototype`

Nur wenn STEP406 eindeutig ergibt, dass ein zusätzlicher produktiver `vip.overlay.*` Event sinnvoll ist.
