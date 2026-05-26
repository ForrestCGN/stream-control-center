# STEP393_DIRECT_OVERLAY_RECONNECT_STABLE

## Status

STABLE bestätigt.

## Aktiver Produktionspfad

```text
/overlays/_overlay-alerts-v2.html
```

Vollständige OBS-URL:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

## Nicht produktiv

```text
/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```

Der iframe-Bridge-Wrapper wird nicht als produktive Alertquelle genutzt.

## Bestätigte Punkte

- STEP390 Direct Overlay Bus Audit: PASS
- STEP391 Direct Overlay Real Flow: PASS
- STEP392 Quick Status: PASS
- Reconnect/Refresh: vom Nutzer nach STEP392 als funktionierend bestätigt

## Technischer Zielzustand

```text
overlayClients=1
DirectOverlayBusClientOnline=True
BridgeClientOnline=False
CommunicationClients=alert_overlay_v2_shadow:alert_system:overlay:online
OverlayWatchdog issues=0
missingFinishAck=0
noClient=0
```

## Entscheidungen

- Keine Rückkehr zur iframe-Bridge als produktive Quelle.
- Direktes Overlay bleibt Single Source für Alert-Rendering in OBS.
- Die vorhandene Legacy-Reconnect-Recovery bleibt gültig.
- Der direkte Bus-Client im echten Overlay bleibt als vorbereiteter Bus-Pfad online.

## Gesperrte/verworfene Stände

- STEP376: nicht einspielen.
- STEP386: verworfen.
- STEP389: höchstens Fallback-Dokumentation, nicht als Aufgabe des Bus-Ziels interpretieren.
