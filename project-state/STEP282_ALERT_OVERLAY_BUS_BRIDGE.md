# STEP282_ALERT_OVERLAY_BUS_BRIDGE

## Ziel

Erster echter Migrationsschritt für das Alert-Overlay in Richtung Communication Bus, ohne die bestehende produktive Alert-Kette zu entfernen.

## Umsetzung

Neu hinzugefügt:

- `htdocs/overlays/_overlay-alerts-v2-bus.html`

Die neue Overlay-Datei ist ein Bridge-/Migrations-Overlay:

- nutzt das bestehende `_overlay-alerts-v2.html` intern im Preview-/Render-Modus
- registriert sich am alten `alert_system`-WebSocket als echtes Alert-Overlay
- registriert sich zusätzlich am Communication Bus als `overlay_alerts_v2_bus_bridge`
- hört auf `visual.alert.play`, `visual.alert.clear` und `visual.alert.resync`
- sendet ACKs an den Communication Bus
- sendet weiterhin `finished` an das alte Alert-System, damit der bestehende Overlay-Watchdog funktioniert
- entfernt `soundUrl` vor dem Rendern, damit keine doppelte lokale Audio-Ausgabe entsteht
- enthält Dedup-Logik, damit derselbe Alert bei Legacy + Bus nicht doppelt angezeigt wird

## Wichtig

Dies ist noch kein Zwangs-Umschalten des bestehenden OBS-Alert-Overlays.

Der bisherige produktive Overlay-Pfad bleibt unverändert:

```text
alert_system -> altes alert_system WebSocket -> _overlay-alerts-v2.html
```

Der neue testbare Migrationspfad ist:

```text
alert_system -> Communication Bus Mirror -> _overlay-alerts-v2-bus.html -> interner Renderer _overlay-alerts-v2.html?preview=1
```

Mit Legacy-Fallback kann die neue Browserquelle auch den alten Alert-System-WebSocket empfangen:

```text
alert_system -> altes alert_system WebSocket -> _overlay-alerts-v2-bus.html
alert_system -> Communication Bus -> _overlay-alerts-v2-bus.html
```

## Test-URL

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1
```

Optional:

```text
?debug=1&bus=1&legacy=1
?debug=1&bus=1&legacy=0
?debug=1&bus=0&legacy=1
```

## Testablauf

1. Bestehende echte Alert-OBS-Quelle nicht gleichzeitig sichtbar lassen, wenn die neue Bridge-Quelle getestet wird.
2. Neue Browserquelle mit der Test-URL öffnen.
3. Für Bus-Test den Mirror aktivieren:

```text
http://127.0.0.1:8080/api/alerts/bus-mirror/enable?confirm=1
```

4. Echten Alert auslösen.
5. Communication Debug Snapshot prüfen.
6. Danach Mirror wieder deaktivieren:

```text
http://127.0.0.1:8080/api/alerts/bus-mirror/disable?confirm=1
```

## Nicht geändert

- keine DB-Migration
- kein Sound-System-Umbau
- keine TTS-Änderung
- keine Queue-Änderung
- keine Entfernung des alten Alert-Overlays
- kein automatischer OBS-Reload

## Folge

Wenn STEP282 stabil ist, kann in STEP283 das Alert-System einen expliziten Bus-Produktivmodus bekommen, statt den bisherigen Test-Mirror als Sender zu nutzen.
