# HT3.4 – HypeTrain Dashboard Merge/Cleanup

## Ziel

Die Event-Actions sollen kein separates Dashboard-Modul sein. Sie gehören in das vorhandene HypeTrain-Dashboard-Modul.

## Änderung

- `hypetrain_event_actions.js` wurde in `hypetrain.js` integriert.
- `hypetrain_event_actions.css` wurde in `hypetrain.css` integriert.
- `index.html` lädt nur noch `hypetrain.js` und `hypetrain.css` für HypeTrain.
- Der Tab `Event-Actions` bleibt erhalten und ist ein echter Tab im HypeTrain-Modul.

## Nicht geändert

- Backend
- Sound-System
- Media-System
- DB

## Nacharbeiten

Nach erfolgreichem Test können die alten Dateien gelöscht werden:

```powershell
Remove-Item ".\htdocs\dashboard\modules\hypetrain_event_actions.js" -Force -ErrorAction SilentlyContinue
Remove-Item ".\htdocs\dashboard\modules\hypetrain_event_actions.css" -Force -ErrorAction SilentlyContinue
```
