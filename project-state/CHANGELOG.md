# Changelog

## 0.2.46 - Remote-Modboard Media Status Compact Source Info

- Erweitert `remote-modboard/backend/src/routes/media-readonly.routes.js` um einen kompakten `sourceInfo` Block.
- Kein neues Modul.
- Kein neuer Endpoint.
- Route bleibt `/api/remote/media/status`.
- Ohne `db=1`: keine DB-Abfrage, `dbIndexChecked=false`.
- Mit `db=1`: nutzt bestehende read-only Schema-/COUNT-Diagnose.
- Keine DB-Item-Reads aus `remote_media_index`.
- Agent-Memory bleibt primaere Online-Wahrheit.
- `fallbackEnabled=false`.
- `writesEnabled=false`.
- Bestaetigt: keine SQL-Ausfuehrung.
- Bestaetigt: keine DB-Migration.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: keine Agent-Writes.
- Bestaetigt: kein Upload/Edit/Delete.

## 0.2.45 - Remote-Modboard Media Index Readonly Source Status Plan

- Schlanker Doku-/State-only Plan fuer eine spaetere read-only DB-Quelle/Fallback-Statusstruktur.
- Funktion geht vor: keine neuen Runtime-Module, keine uebergrosse Statusstruktur.
- Keine Runtime-Code-Aenderung.

## 0.2.44 - Remote-Modboard Media Index Readonly Usage Plan

- Plant spaetere read-only Nutzung von `remote_media_index` als Quelle/Fallback.
- Agent-Memory bleibt primaere Online-Wahrheit.
- Keine Runtime-Code-Aenderung.

## 0.2.43 - Remote-Modboard Media Index Schema Status Readonly Confirmed Docs

- Dokumentiert erfolgreichen 0.2.42 Webserver-Deploy und Readback.

## 0.2.42 - Remote-Modboard Media Index Schema Status Readonly

- Erweitert Media-Statusroute um optionale read-only Diagnose fuer `remote_media_index` ueber `?db=1`.
