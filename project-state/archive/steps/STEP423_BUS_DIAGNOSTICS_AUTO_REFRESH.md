# STEP423 – Bus-Diagnose Auto-Refresh & Live-Status

## Ziel
Die Bus-Diagnose im Dashboard bleibt read-only, bekommt aber einen optionalen Auto-Refresh mit Live-Status und wählbarem Intervall.

## Geänderte Dateien
- `htdocs/dashboard/modules/bus_diagnostics.js`
- `htdocs/dashboard/modules/bus_diagnostics.css`

## Verhalten
- Auto-Refresh kann im Dashboard an/aus geschaltet werden.
- Intervall ist wählbar: 5s, 10s, 30s, 60s.
- Einstellung wird lokal im Browser gespeichert.
- Bei inaktivem Browser-Tab pausiert der Timer.
- Livebar zeigt Ladezustand, letztes Laden, Auto-Status und nächste Aktualisierung.

## Unverändert
- Keine produktive Bus-Steuerung.
- Keine Sound-Queue-Änderung.
- Keine Alert-Flow-Änderung.
- Keine Bundle-/TTS-Änderung.
- Keine Overlay-Steuerung.
- Keine DB-Migration.

## Test
```cmd
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\bus_diagnostics.js
```

Danach Backend neu starten und öffnen:

```text
http://127.0.0.1:8080/dashboard/
Admin → Bus-Diagnose
```

Erwartung:
- Auto-Button sichtbar.
- Intervall-Auswahl sichtbar.
- Livebar sichtbar.
- Status laden funktioniert.
- Auto-Refresh aktualisiert die Diagnose.
- Read-only bleibt `ja`.
- Touched-Werte bleiben `nein`.
