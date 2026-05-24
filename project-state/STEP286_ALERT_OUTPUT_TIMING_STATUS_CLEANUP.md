# STEP286 – Alert Output Timing/Status Cleanup

Datum: 2026-05-24T13:25:00Z

## Ziel

Der erste STEP285-Live-Test hat gezeigt, dass `legacy` und `legacy_and_bus` technisch funktionieren. STEP286 bereinigt daraufhin die Timing-/Statusausgabe der nativen Alert-Outputs, damit `alertOutput.timing`, Bus-Payloads und Watchdog-Ausgabe konsistenter zusammenpassen.

## Ausgangsbefund

Bestätigt wurde:

- `alertOutput.mode = legacy` funktioniert.
- `alertOutput.mode = legacy_and_bus` funktioniert.
- Native Bus-Ausgabe wurde erzeugt.
- Legacy-Ausgabe lief weiter.
- Watchdog meldete `acknowledged`.
- Keine Sound-/TTS-/Queue-Probleme sichtbar.

Auffällig war:

- In `alertOutput.timing` konnte `overlaySentAt` leer wirken, obwohl der Watchdog korrekt `overlaySentAt` führte.

## Geändert

### `backend/modules/alert_system.js`

- `MODULE_STEP` auf `286` gesetzt.
- Neue Helper-Funktion `markVisualOutputSentIfMissing(...)` ergänzt.
- `sendAlertLegacyOutput(...)` markiert visuelle Ausgabe jetzt direkt und konsistent.
- `sendAlertVisualOutput(...)` aktualisiert `alertOutput.lastTiming` nach visueller Ausgabe konsistenter.
- Native Bus-Ausgabe markiert `alertOutputBusSentAt`, bevor die Bus-Payload gebaut wird, damit Timing auch im Bus-Event enthalten ist.
- Der Queue-Prozess aktualisiert `alertOutput.lastTiming` nach dem Output erneut.

## Bewusst nicht geändert

- Keine Sound-System-Änderung.
- Keine TTS-Änderung.
- Keine Sound-/Alert-Queue-Änderung.
- Keine DB-Migration.
- Keine Overlay-Datei geändert.
- Keine Funktionalität entfernt.
- Real Alert Bus Mirror bleibt erhalten.

## Testempfehlung

Nach Entpacken und `stepdone.cmd`:

1. Backend neu starten.
2. `/api/alerts/status` prüfen.
3. Sicherstellen, dass `step = 286` und `alertOutput.mode = legacy` ist.
4. Einen Legacy-Testalert auslösen.
5. Optional erneut `legacy_and_bus` testen.
6. Prüfen, dass `alertOutput.timing.overlaySentAt` und Watchdog-`overlaySentAt` konsistent wirken.
7. Danach wieder auf `legacy` zurückstellen.

## Nächster sinnvoller Schritt

STEP287: `bus_first` gezielt testen.
