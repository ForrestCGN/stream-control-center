# STEP274W FIX4 – Birthday import-media Route Hard Repair

Repariert den teilweisen STEP274W-Stand. Der Backend-Endpunkt `POST /api/birthday/admin/show/import-media` wird als echte Runtime-Route registriert und die Import-Funktion wird als Top-Level-Funktion gesetzt.

## Ausführen

```cmd
cd D:\Git\stream-control-center
node tools\apply_step274w_fix4_birthday_import_route_hard_repair.js
node -c backend\modules\birthday.js
.\stepdone.cmd "STEP274W FIX4 Birthday import-media Route Hard Repair"
```

Danach Backend neu starten und Browser mit Strg+F5 hart neu laden.
