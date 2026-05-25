# STEP421 – Bus-Diagnose im Dashboard-Menü

## Ziel
Die read-only Bus-Diagnose aus STEP420 wird als echtes Dashboard-Modul in das bestehende Control-Center integriert.

## Neue/Geänderte Dateien
- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/modules/bus_diagnostics.js`
- `htdocs/dashboard/modules/bus_diagnostics.css`

## Dashboard-Modul
- Modul-ID: `bus_diagnostics`
- Panel-ID: `busDiagnosticsModule`
- Gruppe: `admin`
- Menü: Admin / Bus-Diagnose
- Reload-Hook: `window.BusDiagnosticsModule.loadAll(true)`

## API-Nutzung
Das Dashboard-Modul liest ausschließlich:
- `/api/bus-diagnostics/status`
- `/api/bus-diagnostics/check`

## Sicherheits-/Flow-Grenzen
- Keine produktive Bus-Steuerung
- Keine Sound-Queue-Änderung
- Keine Alert-Flow-Änderung
- Keine Bundle/TTS-Änderung
- Keine Overlay-Steuerung
- Keine DB-Migration

## Test
```cmd
cd D:\Git\stream-control-center
node --check htdocs\dashboard\app.js
node --check htdocs\dashboard\modules\bus_diagnostics.js
```

Danach Backend neu starten und Dashboard öffnen:

```text
http://127.0.0.1:8080/dashboard/
```

Erwartung:
- Admin-Bereich zeigt `Bus-Diagnose`
- Modul lädt Statuskarten für Communication, Sound, Alert und Korrelation
- `Status laden` und `Check ausführen` funktionieren
- Schutzwerte bleiben `flowTouched=false`, `queueTouched=false`, `soundSystemTouched=false`, `alertSystemTouched=false`, `overlayTouched=false`
