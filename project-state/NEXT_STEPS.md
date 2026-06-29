# NEXT_STEPS

## Naechster technischer Schritt

`RDAP_0.2.55_MEDIA_FULL_SYNC_CHUNK_RECEIVER`

Ziel:

- Full-Sync-Agent -> Webserver in Chunks.
- Server validiert Chunks streng.
- Schreiben nach `remote_media_index` nur mit separaten MEDIA_INDEX Gates und expliziten Confirm-/Sync-Gates.
- DB-Index danach mit Media-Daten befuellen.
- Remote-Modboard-Lesequelle erst in einem separaten Folgeschritt kontrolliert von Agent-Memory auf DB-Index umstellen.

## Grenzen

- Keine Upload/Edit/Delete-Buttons.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Online->Agent-Dateiaktionen.
