# Next Steps

Nach `0.2.47`:

## 1. Lokal pruefen

```powershell
node --check .\remote-modboard\backend\public\assets\modules\media\library.js
node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\server.js

git status
```

Wenn sauber:

```powershell
.\stepdone.cmd "RDAP 0.2.47 Media UI Source Info Badge vorbereitet; Quelle/DB/Fallback/Writes sichtbar, keine neuen Endpoints, keine Writes"
```

## 2. Webserver-Deploy nach GitHub/dev-Push

Runtime/UI-Datei wurde geaendert, daher Deploy notwendig.

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.47_REMOTE_MODBOARD_MEDIA_UI_SOURCE_INFO_BADGE dev
```

## 3. Server-/Browser-Readback

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/media/status" | jq '.sourceInfo'
```

Browser:

```text
Remote-Modboard -> Media-System oeffnen.
Quelle/Agent/DB/Fallback/Writes muessen sichtbar sein.
Fallback und Writes muessen aus sein.
```

## Nicht tun

```text
Kein ?db=1 aus der UI erzwingen.
Keine DB-Item-Reads.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Kein neuer Endpoint.
Kein neues Modul.
```
