# NEXT_STEPS

## Nach STEP278U

1. Backend nach Deploy starten.
2. Communication Debug View öffnen:
   - `http://127.0.0.1:8080/public/tools/communication_debug_view.html`
3. Sichtprüfung:
   - Tool v0.1.3
   - Auto: an
   - Auto-Refresh-Button sichtbar
   - keine STEP-/Build-Anzeige sichtbar
4. Master-Test-Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
5. Alert-Mirror-Test senden:
   - `http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Auto%20Refresh%20Test&ttlMs=60000`
6. In der Debug View prüfen:
   - `emitted` steigt automatisch
   - `delivered` steigt automatisch
   - `acks` steigt automatisch
   - Event `visual.alert.play` wird ohne Page-Reload sichtbar
   - `issues` bleibt `0`
7. Auto-Refresh ausschalten.
8. Noch ein Testevent senden.
9. Prüfen:
   - Werte ändern sich erst wieder nach manuellem Status aktualisieren oder Reaktivieren des Auto-Refresh.

Wenn stabil: nächster Schritt kann ein kontrollierter Alert-System-Mirror-Hook sein, weiterhin ohne Produktivmigration.
