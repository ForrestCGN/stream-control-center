# NEXT_STEPS

## Nach STEP278W

1. Mirror aktivieren:

```text
http://127.0.0.1:8080/api/alerts/bus-mirror/enable?confirm=1
```

2. Echten Alert-Test auslösen.

3. Timing prüfen:

```text
http://127.0.0.1:8080/api/alerts/bus-mirror/status
```

4. Wenn Timing stabil ist, nächster Schritt:

```text
STEP278X_ALERT_OVERLAY_DELIVERY_WATCHDOG
```

Ziel STEP278X: erkennen, ob Alert-Overlay-/Bus-Delivery nach Play fehlt oder ACK ausbleibt.

## Vorherige NEXT_STEPS

# NEXT_STEPS

## Nach STEP278V2 testen

1. ZIP einspielen.
2. Backend starten.
3. Master-Test-Overlay öffnen.
4. Communication Debug View öffnen.
5. Mirror-Status prüfen.
6. Mirror aktivieren.
7. Echten Alert-Test über bestehendes Alert-System auslösen.
8. Prüfen, ob `visual.alert.play` mit source `alert_system` im Bus erscheint.
9. Mirror wieder deaktivieren.

Erst nach stabilem Test über echte Alert-Payloads über produktivere Umschaltung sprechen.
