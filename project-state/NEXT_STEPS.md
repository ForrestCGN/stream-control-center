# NEXT_STEPS

## Test STEP281

1. Backend neu starten.
2. Debug View öffnen:
   `http://127.0.0.1:8080/public/tools/communication_debug_view.html`
3. Bereich `Normalbetrieb / Live-Check` prüfen.
4. Button `Normalbetrieb prüfen` testen.
5. Nach Alert-Tests den Real Alert Mirror wieder deaktivieren.

## Bei erneutem Alert-Fehler

1. Diagnose-Snapshot erzeugen.
2. Snapshot sichern/kopieren.
3. Erst danach Overlay Recovery Clear oder OBS-Reload ausführen.


## Nach STEP282

- Neue Bridge-Overlay-Quelle separat testen: `/overlays/_overlay-alerts-v2-bus.html?debug=1`.
- Für Bus-Test den Alert Bus Mirror temporär aktivieren.
- Danach entscheiden, ob STEP283 einen expliziten Bus-Produktivmodus im Alert-System bekommt.
