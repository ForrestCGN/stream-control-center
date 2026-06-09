# NEXT_STEPS – Loyalty Giveaways / Glücksrad

## Nächster technischer Schritt

### LWG-4M.5 – Bound Wheel aktivieren und beim Claim verwenden

Ausgangslage:
- `LWG-4M.4` erzeugt bereits ein bound Wheel pro Wheel-Giveaway.
- Das Bound Wheel steht aktuell noch auf `draft`.
- Bestehender Wheel-Claim funktioniert grundsätzlich, muss aber auf die gebundene Konfiguration umgestellt/abgesichert werden.

Ziele:
1. Bound-Wheel-Status sauber machen.
2. Draw/Permission auf `wheelSnapshotUid`/BoundWheel ausrichten.
3. Claim per `!wheel`/`!rad` nutzt das Bound-Wheel.
4. Globale Wheel-Spins bleiben getrennt.

## Vorgeschlagene Reihenfolge

1. Aktuellen Code `backend/modules/loyalty_giveaways.js` aus LWG-4M.4 als Basis nehmen.
2. Prüfen, wie `drawWinner` aktuell Wheel-Permission erzeugt.
3. Prüfen, wie `claimWheelSpin` aktuell `wheelPresetUid` an `loyalty_games._private.startWheelSpin()` übergibt.
4. Guard einbauen:
   - Wheel-Giveaway ohne Bound-Wheel darf nicht Draw/Claim ausführen.
   - Permission muss Bound-Wheel referenzieren.
5. Test-ZIP erstellen.
6. StepDone vor Test.
7. Live-Test:
   - Wheel-Giveaway erstellen.
   - Bound-Wheel prüfen.
   - Giveaway öffnen.
   - Ticket eintragen.
   - Close.
   - Draw.
   - Permission prüfen.
   - `!wheel`/Claim ausführen.
   - Prüfen, dass Spin mit Bound-Wheel-Kontext protokolliert wurde.

## Danach

### LWG-4M.6
Dashboard UI für Giveaway-Wheel-Dropdown.

### LWG-4M.7
Preset-/Wheel-Editor Modal mit Kontext `global` oder `giveaway`.
