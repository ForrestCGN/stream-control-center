# STEP422 – Bus Diagnostics Dashboard UX Cleanup

## Ziel
Die Bus-Diagnose im Dashboard wurde optisch und funktional verfeinert, ohne produktive Bus-, Sound-, Alert-, Queue-, Bundle-, TTS- oder Overlay-Flows zu verändern.

## Dateien
- `htdocs/dashboard/modules/bus_diagnostics.js`
- `htdocs/dashboard/modules/bus_diagnostics.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderungen
- Schnellzugriffe für Sound-Debug, Alert-Debug und Standalone-Bus-Diagnose ergänzt.
- Sound-/Alert-Debug-Status mit kurzer Hilfsinfo versehen.
- Capability-Werte im Dashboard besser lesbar gemacht und über volle Kartenbreite dargestellt.
- Zusätzliche kleine UX-Verbesserungen für Links, Hover und mobile Darstellung.

## Schutz
- Keine Backend-Logik geändert.
- Keine produktive Steuerung ergänzt.
- Kein Sound-System-Flow geändert.
- Kein Alert-System-Flow geändert.
- Keine Queue-/Bundle-/TTS-/Overlay-Logik geändert.
- Keine DB-Migration.

## Tests
```cmd
node --check htdocs\dashboard\modules\bus_diagnostics.js
```
