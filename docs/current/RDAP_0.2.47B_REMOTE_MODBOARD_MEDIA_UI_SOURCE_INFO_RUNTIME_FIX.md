# RDAP 0.2.47B - Remote-Modboard Media UI Source Info Runtime Fix

Stand: 2026-06-29

## Ziel

Fix fuer leere Media-UI nach 0.2.47.

Die API war korrekt und die Datei wurde live ausgeliefert. Der Fix bleibt deshalb im bestehenden Media-UI-Modul und macht das Rendering robuster.

## Geaendert

```text
remote-modboard/backend/public/assets/modules/media/library.js
```

## Inhalt

```text
- install() laeuft nur noch einmal.
- Wenn das Script vor DOM-Ready geladen wird, wird erst nach DOMContentLoaded installiert.
- render() wird ueber safeRender() abgesichert.
- Runtime-Renderfehler werden sichtbar in der Media-Seite angezeigt statt die Seite leer zu lassen.
- sourceInfo/Inventory/Permissions werden defensiv gelesen.
- Filter/Refresh rendern ebenfalls ueber safeRender().
```

## Nicht geaendert

```text
- kein Backend
- kein neuer Endpoint
- keine API-Aenderung
- keine DB-Item-Reads
- keine SQL-Ausfuehrung
- keine DB-Migration
- keine Media-Daten-Writes
- keine Agent-Writes
- kein Upload/Edit/Delete
```

## Checks lokal

```powershell
node --check .\remote-modboard\backend\public\assets\modules\media\library.js
node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\server.js

git status
```

## Server-Checks

```bash
node --check /opt/stream-control-center/remote-modboard/backend/public/assets/modules/media/library.js
curl -fsS "http://127.0.0.1:3010/assets/modules/media/library.js" | grep -n "safeRender\|DOMContentLoaded\|renderSourceInfoRows\|Quelle"
curl -fsS "http://127.0.0.1:3010/api/remote/media/status" | jq '.ok,.inventory.active,.sourceInfo.primaryActive'
```

Browser:

```text
Remote-Modboard -> Media-System
Hart neu laden: Strg+F5
Media-Inhalt muss sichtbar sein.
Quelle / Agent / DB / Fallback / Writes muessen sichtbar sein.
Fallback/Writes bleiben aus.
```
