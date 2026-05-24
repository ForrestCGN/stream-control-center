# NEXT_STEPS

## Nach STEP278S

1. Backend nach Deploy neu starten.
2. Communication Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
   - Erwartung: `moduleVersion` ist `0.7.0`.
3. Master-Test-Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
4. Communication Debug View öffnen:
   - `http://127.0.0.1:8080/public/tools/communication_debug_view.html`
5. In der Debug View prüfen:
   - Tool-Anzeige `Tool v0.1.2`
   - keine sichtbaren STEP-/Build-Werte
   - Client `overlay_master_test` connected
6. Alert-Mirror-Test senden:
   - über Button `Alert Mirror Test`
   - oder direkt: `http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Alert%20Mirror%20Test`
7. Erwartung:
   - Master-Test-Overlay zeigt eine Alert-Mirror-Karte
   - Debug View zeigt Event `visual.alert.play`
   - `delivered` steigt
   - `acks` steigt
   - `issues` bleibt 0
8. Watchdog prüfen:
   - `http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1`

Wenn stabil: nächsten Schritt planen. Sinnvoll wäre danach eine Analyse, wie ein echtes Alert-System-Event zusätzlich als Mirror-Signal in den Bus gespiegelt werden kann, weiterhin ohne Produktivumschaltung.
