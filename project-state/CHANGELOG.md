# CHANGELOG

## STEP455 – Sound-System Overlay Bus Consumer Replacement

- `htdocs/overlays/sound_system_overlay.html` als direkten Sound-Bus-Consumer erweitert.
- Bus-Envelope-Normalisierung für `sound` / `sound.event_output` ergänzt.
- `bus_hello` Registrierung und `bus_ack` Antworten ergänzt.
- Bestehender Legacy-WebSocket `op:sound_system` bleibt erhalten.
- Bestehendes `/api/sound/status` Polling bleibt erhalten.
- Kein Backend-/Queue-/TTS-/Discord-/Dashboard-Umbau.
- Keine bestehende Funktionalität entfernt.


## STEP454 – Alert Bus First Productive Switch

- `backend/modules/alert_system.js` auf Version `3.1.4` erhöht.
- Alert-Output-Default von `legacy_and_bus` auf `bus_first` geändert.
- Produktiver Alert-Flow nutzt jetzt zuerst den Communication-Bus über `visual.alert/play`.
- Legacy-Overlay-Ausgabe bleibt als Fallback aktiv, falls Bus-Auslieferung fehlschlägt oder keine Empfänger erreicht.
- Kein Wechsel auf `bus_only`.
- Keine Änderungen am Sound-System, TTS, Dashboard oder an Alert-Regeln.

## STEP453 – Alert Bus Safe Parallel Integration

- `backend/modules/alert_system.js` auf Version `3.1.3` erhöht.
- Alert-Output-Default von `legacy` auf `legacy_and_bus` geändert.
- Communication-Bus-Ausgabe für Alerts nutzt den bestehenden Channel `visual.alert` mit `play` und `clear`.
- Bestehender Legacy-Overlay-Weg blieb aktiv.
