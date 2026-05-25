# Current System Status – STEP393 Append

## Alert Overlay

Aktive OBS-Quelle:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Status:

- Direct legacy overlay connected: yes
- Direct overlay bus shadow client: online
- Bridge wrapper: not active
- Real alert flow: confirmed
- Reconnect/refresh: confirmed by user
- Watchdogs: green

## Important warnings

Do not activate the iframe bridge wrapper as production source:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```

Do not install/use STEP376 or STEP386.
