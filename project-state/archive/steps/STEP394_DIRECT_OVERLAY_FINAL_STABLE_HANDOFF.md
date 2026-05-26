# STEP394_DIRECT_OVERLAY_FINAL_STABLE_HANDOFF

## Zweck

Dieser STEP hält den funktionierenden finalen Stand nach den Bridge-/Reconnect-Tests fest.

## Ergebnis

Die vorherige iframe-Bridge-Problematik ist aufgelöst, indem wieder das echte Overlay direkt genutzt wird:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Dabei bleibt der Bus-Client im Overlay aktiv:

```text
alert_overlay_v2_shadow
```

## Gültige Vorarbeit

- STEP390: direkter Bus-Test im echten Overlay PASS.
- STEP391: realer Alert-Flow mit Sound/TTS PASS.
- STEP392: Stable-Handoff PASS.
- STEP393A: PS5.1-kompatibler Quickcheck PASS.
- Reconnect/Refresh wurde manuell bestätigt.

## Nicht mehr verwenden

- STEP376
- STEP386
- `_overlay-alerts-v2-bus.html` als produktive OBS-Quelle

## Offener Feinschliff

Timing-Feintuning nur bei Bedarf:
- Sound gefühlt minimal spät beim ersten Test.
- Anzeige eventuell etwas knapp.
- Zweiter Test war perfekt, daher kein Blocker.
