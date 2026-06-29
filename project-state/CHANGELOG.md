# CHANGELOG

## 0.2.54 - Media Index Schema and Write Gate

- Separates Media-Index-Write-Gate vorbereitet.
- `MEDIA_INDEX_*` ENV-Gates fuer Schema/Data/Full-Sync vorbereitet.
- DB-Write-Scopes in `db.service.js` vorbereitet, ohne bestehende Auth-/Session-Write-Logik freizuschalten.
- Media-Status liefert `mediaIndexWriteGate` und `mediaIndexSchemaGate`.
- Neue Statusrouten fuer Write-Gate und Schema-Diagnose.
- Schema-Prepare-Route ist local-only, confirm-geschuetzt und standardmaessig durch Gates blockiert.
- Keine Media-Datenwrites.
- Keine Upload/Edit/Delete-Funktion.
- Keine Datei-Inhalte oder absoluten Pfade.

## 0.2.53B - Media Sync Card replaces Hinweis

- Hinweis-Karte durch Sync-Status ersetzt.
- Medienliste darunter full-width.
