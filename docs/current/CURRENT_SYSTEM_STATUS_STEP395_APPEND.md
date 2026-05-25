# CURRENT SYSTEM STATUS – STEP395 Append

## Alert Direct Overlay Stable

Aktiver Produktionspfad:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Nicht produktiver Test-/Bridge-Pfad:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```

## Bestätigter Zustand

- Alert-System: erreichbar, STEP365 Runtime.
- Overlay: 1 aktiver Legacy-Overlay-Client.
- Direkter Bus-Client: `alert_overlay_v2_shadow` online.
- Bridge-Wrapper: nicht aktiv.
- Real Flow: Sound/TTS läuft.
- Reconnect/Refresh: bestätigt.
- Watchdogs: grün.
- Orphan-Lock: nicht vorhanden.

## Hinweis

Der Communication-Bus bleibt für Alert-Visuals vorbereitet, aber die produktive Darstellung läuft direkt im echten Overlay und nicht über einen iframe-Wrapper.
