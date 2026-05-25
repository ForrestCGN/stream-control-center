# CURRENT SYSTEM STATUS – STEP392 Append

## Alert Direct Overlay Stand

Stand 2026-05-25:

Das produktive Alert-Overlay ist wieder das direkte echte Overlay:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Der direkte Bus-Client im Overlay ist online:

```text
alert_overlay_v2_shadow alert_system overlay online
```

Der iframe-Bridge-Wrapper ist nicht mehr Produktionspfad.

## Stabil bestätigt

STEP391 bestätigte den echten Alert-System-Flow mit:

- Legacy-Overlay-Verbindung `overlayClients=1`
- Bus-Shadow-Client online
- Sound über Sound-System
- TTS nach Sound
- OverlayWatchdog ohne Issues
- CommunicationWatchdog ohne Issues
- kein Orphan-Lock
- Queue leer nach Ablauf

## Offene Feintuning-Notiz

Das Timing zwischen Visual, Sound und TTS soll später optional geprüft werden.
Keine akute Fehlfunktion; der zweite Lauf war visuell perfekt.
