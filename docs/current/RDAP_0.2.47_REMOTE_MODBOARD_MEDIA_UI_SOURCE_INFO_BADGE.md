# RDAP 0.2.47 - Remote-Modboard Media UI Source Info Badge

Stand: 2026-06-29

## Ziel

Dieser Step macht die in 0.2.46 vorbereitete `sourceInfo` sichtbar in der bestehenden Media-UI.

Es wird kein neuer Endpoint angelegt.  
Es wird kein neues Modul angelegt.  
Es wird keine DB-Abfrage aus der UI erzwungen.  
Es werden keine DB-Item-Reads gemacht.  
Es werden keine Media-Daten geschrieben.

## Geaendert

```text
remote-modboard/backend/public/assets/modules/media/library.js
```

## Funktion

Die bestehende Media-Seite liest weiter nur:

```text
GET /api/remote/media/status
```

Neu sichtbar in der UI:

```text
- Statuskarte Quelle
- Agent-Memory aktiv / wartet
- DB-Index nicht geprueft oder bereit
- Fallback aus
- Writes aus
- Karte Agent / DB / Fallback mit kompakten Zeilen
```

## Sicherheitsgrenzen

```text
Kein neuer Endpoint.
Kein neues Backend-Modul.
Kein ?db=1 aus der UI.
Keine DB-Item-Reads aus remote_media_index.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Agent-Memory bleibt primaere Online-Wahrheit.
Fallback bleibt aus.
```

## Lokale Checks

```powershell
node --check .\remote-modboard\backend\public\assets\modules\media\library.js
node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js
node --check .\remote-modboard\backend\src\app.js
node --check .\remote-modboard\backend\server.js

git status
```

## Server-Checks nach Deploy

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/media/status" | jq '.sourceInfo'
```

Browser-Check:

```text
Remote-Modboard -> Media-System oeffnen.
Quelle/Agent/DB/Fallback/Writes muessen sichtbar sein.
Fallback und Writes muessen aus bleiben.
```
