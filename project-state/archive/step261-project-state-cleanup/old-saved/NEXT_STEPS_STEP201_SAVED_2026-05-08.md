# NEXT STEPS – nach STEP201 Current Save

## Nächster Hauptpunkt

```text
STEP201.12e – Twitch-Hauptmodul bewerten/planen
```

## Wichtig

`backend/modules/twitch.js` nicht ohne vollständige echte Datei patchen.

## Vorbereitende Befehle

```powershell
cd D:\Git\stream-control-center
git status
git log -1 --oneline
```

Falls `twitch.js` benötigt wird:

```powershell
cd D:\Git\stream-control-center
Get-Content .\backend\modules\twitch.js -Raw | Set-Content D:\gpt\twitch_js.txt -Encoding UTF8
```

Gezielter Routen-Auszug:

```powershell
cd D:\Git\stream-control-center
Select-String -Path .\backend\modules\twitch.js -Pattern "registerGet|registerPost|/api/twitch|/twitch|module.exports" -Context 3,3 |
  Out-File D:\gpt\twitch_routes_extract.txt -Encoding UTF8
```

## Danach

Erst bewerten:

```text
- produktive Prefixe
- Legacy-Pfade
- kritische Aktionen
- mögliche Diagnose-Endpunkte
- mögliche Risiken
```

Nicht direkt umbauen.
