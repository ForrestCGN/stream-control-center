# NEXT_STEPS

## Nach STEP278X testen

1. Backend starten.
2. Echtes Alert-Overlay in OBS oder Browser öffnen.
3. Optional Bus-Mirror aktivieren:

```text
/api/alerts/bus-mirror/enable?confirm=1
```

4. Einen echten Alert-Test auslösen.
5. Prüfen:

```text
/api/alerts/overlay-watchdog/status
/api/alerts/bus-mirror/status
/api/communication/status
```

Erwartung:

```text
overlay-watchdog last.status = acknowledged
stats.missingFinishAck = 0
stats.noClient = 0
```

## Möglicher nächster Schritt

STEP278Y: echte Alert-Overlay-Receipt-ACKs ergänzen, damit Empfang sofort bestätigt wird und nicht erst am Ende des Alerts.
