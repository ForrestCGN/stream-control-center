# STEP273B1 – Commands Dashboard Hook Fix

## Zweck

STEP273B-Dateien waren nicht im Dashboard verdrahtet. Dieser Fix liefert ein robustes Hook-Script und die Dashboard-Moduldateien erneut.

## Geändert

- `htdocs/dashboard/modules/commands.js`
- `htdocs/dashboard/modules/commands.css`
- `tools/easy/STEP273B1_APPLY_DASHBOARD_COMMANDS_FIX.cjs`

Das Hook-Script patcht:

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`

## Tests

```bat
node tools\easy\STEP273B1_APPLY_DASHBOARD_COMMANDS_FIX.cjs
node --check htdocs\dashboard\modules\commands.js
node --check tools\easy\STEP273B1_APPLY_DASHBOARD_COMMANDS_FIX.cjs
```

Danach prüfen:

```powershell
Select-String -Path "D:\Git\stream-control-center\htdocs\dashboard\index.html" -Pattern "commands.css|commands.js|commandsModule"
Select-String -Path "D:\Git\stream-control-center\htdocs\dashboard\app.js" -Pattern "panelId: 'commandsModule'|commands:"
```
