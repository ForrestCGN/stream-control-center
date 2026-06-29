# RDAP 0.2.54 - Media Index Schema and Write Gate

## Zweck

Dieser Step bereitet den Online-Media-Index fuer den naechsten Full-Sync-Block vor.

## Inhalt

- Separates Media-Index-Write-Gate in der Config.
- Media-Index-Writes sind von Auth-/Session-Writes getrennt.
- Neue Statusrouten fuer Write-Gate und Schema-Diagnose.
- Schema-Prepare-Route ist vorhanden, aber standardmaessig blockiert.
- Schema-Prepare ist local-only, braucht `confirmWrite:true` und `schemaOnly:true` und separate `MEDIA_INDEX_*` ENV-Gates.
- Es werden keine Media-Daten geschrieben.
- Es werden keine Datei-Inhalte oder absoluten Pfade synchronisiert.
- Upload/Edit/Delete bleiben deaktiviert.

## Neue/aktualisierte Routen

- `GET /api/remote/media/index/write-gate/status`
- `GET /api/remote/media/index/schema/status`
- `POST /api/remote/media/index/schema/prepare`

Die POST-Route schreibt nur Schema-Struktur, wenn die Gates aktiv sind. Sie schreibt keine Media-Items und bleibt local-only.

## ENV-Gates

- `MEDIA_INDEX_WRITE_ENABLED=true`
- `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=true`
- `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
- `MEDIA_INDEX_FULL_SYNC_ENABLED=true`

0.2.54 nutzt nur die Schema-Gates. Full-Sync-Datenwrites folgen separat.

## Grenzen

- Keine Upload/Edit/Delete-Funktion.
- Keine Full-Sync-Datenwrites.
- Keine Delta-Sync-Writes.
- Keine Online->Agent-Auftraege.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
