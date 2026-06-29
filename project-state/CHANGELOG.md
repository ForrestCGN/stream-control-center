# Changelog

## 0.2.45 - Remote-Modboard Media Index Readonly Source Status Plan

- Dokumentiert einen schlanken Plan fuer eine spaetere `persistentIndexSource` Statusstruktur.
- Haelt fest: Funktion geht vor, keine Modul-Aufblaehung.
- Haelt fest: Agent-Memory bleibt primaere Online-Wahrheit.
- Haelt fest: DB-Quelle bleibt disabled.
- Haelt fest: `fallbackEnabled=false` bleibt Standard.
- Haelt fest: `itemCount=0` ist kein Fehler.
- Haelt fest: `deleted=1` darf nicht normal sichtbar sein.
- Haelt fest: `stale` bleibt diagnostisch.
- Bestaetigt: keine Runtime-Code-Aenderung.
- Bestaetigt: keine SQL-Ausfuehrung.
- Bestaetigt: keine DB-Migration.
- Bestaetigt: keine SELECT-Item-Liste aus `remote_media_index`.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: keine Agent-Writes.
- Bestaetigt: kein Upload/Edit/Delete.
- Bestaetigt: kein Webserver-Deploy.

## 0.2.44 - Remote-Modboard Media Index Readonly Usage Plan

- Dokumentiert den Plan fuer spaetere read-only Nutzung von `remote_media_index`.
- Agent-Memory bleibt vorerst primaere Online-Wahrheit.
- Keine Runtime-Aenderung.
- Keine Media-Daten-Writes.

## 0.2.43 - Remote-Modboard Media Index Schema Status Readonly Confirmed Docs

- Dokumentiert Webserver-Deploy und Readback von 0.2.42.
- `remote_media_index` detected=true, `itemCount=0`, `compatibleForRead=true`.
- Writes bleiben blockiert.

## 0.2.42 - Remote-Modboard Media Index Schema Status Readonly

- Erweitert `remote-modboard/backend/src/routes/media-readonly.routes.js` um optionale read-only Diagnose fuer `remote_media_index`.
- Neue Diagnose ueber `GET /api/remote/media/status?db=1`.
- Liest nur INFORMATION_SCHEMA und COUNT(*).
- Keine Media-Daten-Writes.
