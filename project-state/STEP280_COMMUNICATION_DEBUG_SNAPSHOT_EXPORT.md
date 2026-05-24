# STEP280 – Communication Debug Snapshot Export

Status: bereit zum Testen

## Ziel

Die Communication Debug View kann jetzt einen manuellen Diagnose-Snapshot erzeugen. Damit lassen sich Bus-, Alert-Mirror-, Timing-, Overlay-Watchdog- und Queue-Status in einem JSON sichern, wenn der Alert-Fehler im Live-Betrieb erneut auftritt.

## Eigenschaften

- Kein neues Modul.
- Keine DB-Migration.
- Keine Änderung an Sound, TTS, Queue oder Overlay-Playback.
- Kein automatisches Recovery.
- Snapshot wird nur im Browser erzeugt.
- Download/Kopieren erfolgt lokal im Browser.

## Enthaltene Snapshot-Daten

- `/api/communication/status`
- `/api/communication/watchdog?includeRecovered=1`
- `/api/alerts/bus-mirror/status`
- `/api/alerts/overlay-watchdog/status`
- `/api/alerts/overlay-watchdog/check`
- `/api/alerts/queue`

## Test

1. Debug View öffnen.
2. Button `Diagnose-Snapshot` klicken.
3. Kurzfassung prüfen.
4. Optional `Snapshot herunterladen` oder `Snapshot kopieren`.
