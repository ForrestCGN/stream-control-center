# STEP193.14 - SoundAlerts Local Overlay Test Workflow

Stand: 2026-05-06

## Ziel

SoundAlerts-Einträge sollen besser testbar sein, weil die Ausgabe je nach Eintrag über `device`, `overlay` oder `both` laufen kann.

## Geändert

- Dashboard-Hero enthält `🖥️ Lokales Overlay`.
- `Bot & Settings` enthält einen Bereich `Lokaler Overlay-Test`.
- Lokales Overlay öffnet `/overlays/sound_system_overlay.html?debug=1`.
- Eintragskarten zeigen das aktuelle Ausgabeziel als Chip: `Device`, `Overlay` oder `Beides`.
- Im Eintrag-Editor ist das Ausgabeziel jetzt bearbeitbar.
- Hinweis ergänzt: Der Test nutzt das gespeicherte Ausgabeziel; Overlay-/Beides-Tests brauchen ein geöffnetes lokales oder OBS-Sound-Overlay.
- Doppelte/widersprüchliche Status-Chips bei Datei-fehlt-Einträgen reduziert.

## Nicht geändert

- Keine Backend-Änderung.
- Keine API-Änderung.
- Keine DB-Schemaänderung.
- Keine bestehende Funktionalität entfernt.

## Betroffene Dateien

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Test

```powershell
cd D:\Git\stream-control-center
node --check .\htdocs\dashboard\modules\soundalerts.js
```

Dashboard prüfen:

- `SoundAlerts > Bot & Settings > Lokaler Overlay-Test`
- Button `🖥️ Overlay öffnen`
- `SoundAlerts > Einträge`
- Eintrag mit Ausgabeziel `Device` testen
- Eintrag mit Ausgabeziel `Overlay` oder `Beides` testen, während das lokale Overlay geöffnet ist
