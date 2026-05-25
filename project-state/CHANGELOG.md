# CHANGELOG

## STEP453 – Alert Bus Safe Parallel Integration

- `backend/modules/alert_system.js` auf Version `3.1.3` erhöht.
- Alert-Output-Default von `legacy` auf `legacy_and_bus` geändert.
- Runtime-Sicherheitsanhebung ergänzt: Wenn `alertOutput.mode` aus bestehender Config noch `legacy` ist und kein `ALERT_OUTPUT_MODE` gesetzt wurde, wird aktiv `legacy_and_bus` verwendet.
- Communication-Bus-Ausgabe für Alerts nutzt weiterhin den bestehenden Channel `visual.alert` mit `play` und `clear`.
- Bestehender Legacy-Overlay-Weg bleibt aktiv.
- Kein Wechsel auf `bus_first` oder `bus_only` in diesem Schritt.
- Keine Änderungen am Sound-System, TTS, Dashboard oder an Alert-Regeln.
