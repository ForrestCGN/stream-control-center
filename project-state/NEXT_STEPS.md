# NEXT_STEPS

## Nach STEP278T

1. Backend nach Deploy starten.
2. Master-Test-Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
3. Sichtprüfung:
   - Client-Zeile zeigt `overlay_master_test · overlay · v0.1.3`
   - keine STEP-/Build-Anzeige sichtbar
   - Debug-Zeile `Watchdog` ist vorhanden
4. Communication Debug View öffnen:
   - `http://127.0.0.1:8080/public/tools/communication_debug_view.html`
5. Status aktualisieren und prüfen:
   - Client `overlay_master_test`
   - Version `0.1.3`
   - Status `connected`
6. Alert-Mirror-Test senden:
   - `http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Reconnect%20Robustness%20Test&ttlMs=60000`
7. Prüfen:
   - Overlay zeigt Bus-Mirror-Karte
   - Debug View zeigt `visual.alert.play`
   - `delivered > 0`
   - `acks > 0`
   - `issues = 0`
8. Backend-Neustart-/Deploy-Test:
   - Overlay offen lassen
   - Backend neu starten oder Deploy ausführen
   - nicht manuell reloaden
   - warten, bis Overlay automatisch reconnectet
   - erneut `test-alert` senden
9. Erwartung:
   - Overlay ist automatisch wieder verbunden
   - Alert-Mirror kommt ohne manuellen Reload an
   - ACK kommt zurück

Wenn stabil: Nächster Schritt kann ein kontrollierter echter Alert-Mirror aus dem Alert-System sein, weiterhin zusätzlich/mirrornd und ohne Produktivmigration.
