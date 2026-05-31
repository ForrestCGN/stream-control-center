# STEP626F – Inventar-Statuslogik korrigieren

Stand: 2026-05-31
Version: v0.1.0

## Ziel

Das OBS-Inventar soll nur dann Warnungen anzeigen, wenn wirklich eine aktive, effektiv sichtbare CGN-Overlayquelle in der aktuellen Program-Szene keinen passenden Bus-/Heartbeat-Status hat.

## Änderungen

- CGN-Quellen mit Bus-Client und echtem Heartbeat werden als `OK` bewertet.
- Quellen außerhalb der aktuellen Program-Szene werden als `standby`/inaktiv bewertet, nicht als Warnung.
- Effektiv ausgeblendete Quellen bleiben wartend/inaktiv.
- Externe Quellen und Platzhalter erwarten weiterhin keinen Bus.
- Die Inventar-Baumansicht zeigt zusätzlich, wenn ein Eintrag nicht zur aktuellen Program-Szene gehört.
- Die Inventar-Tabelle nutzt die korrigierte Backend-Bewertung.

## Betroffene Dateien

- `backend/modules/overlay_monitor.js`
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Nicht geändert

- Keine OBS-Aktionen
- Keine Reparaturbuttons
- Kein Cache-Refresh
- Keine Dateien gelöscht
- Keine Heartbeat-Historie

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\overlay_monitor.js
node --check htdocs\dashboard\modules\overlays.js
.\stepdone.cmd "STEP626F OBS-Inventar Statuslogik korrigieren"
```

Danach Backend neu starten, Dashboard hart neu laden und im Tab `OBS-Inventar` aktualisieren.
