# NEXT_STEPS

## Nach STEP278R

1. Backend nach Deploy starten.
2. Communication Debug View öffnen:
   - `http://127.0.0.1:8080/public/tools/communication_debug_view.html`
3. Sichtprüfung:
   - oben keine STEP-Anzeige mehr
   - Tool-Anzeige nur `Tool v0.1.1`
   - Bus-Modul zeigt nur Versionsnummer, z. B. `0.6.0`
   - Details/Logs zeigen keine `moduleBuild`, `build` oder `step` Felder sichtbar
4. Status aktualisieren.
5. Master-Test-Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
6. Testevent senden:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Version%20Display%20Cleanup&requireAck=1&replayable=1`
7. In der Debug View prüfen:
   - Client connected
   - Event sichtbar
   - ACK sichtbar
   - keine sichtbaren STEP-/Build-Werte

Wenn stabil: STEP278S planen. Sinnvoller nächster Schritt ist ein kontrollierter Alert-Mirror-Test über den Communication Bus, weiterhin ohne Produktivmigration.
