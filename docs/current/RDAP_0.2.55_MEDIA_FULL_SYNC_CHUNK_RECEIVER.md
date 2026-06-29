# RDAP 0.2.55 - Media Full-Sync Chunk Receiver

## Zweck

Dieser Step bereitet den echten Full-Sync des lokalen Media-Inventars vom Stream-PC zum Remote-Modboard vor.

## Aenderung

- Der lokale Agent kann zusaetzlich zum bestehenden kompakten Memory-Frame Full-Sync-Chunks senden.
- Der Remote-Agent-Runtime-Receiver nimmt `media_inventory_full_sync_chunk` Frames an.
- Chunks werden streng validiert.
- DB-Writes nach `remote_media_index` erfolgen nur, wenn alle Media-Index-Gates aktiv sind:
  - `MEDIA_INDEX_WRITE_ENABLED=true`
  - `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
  - `MEDIA_INDEX_FULL_SYNC_ENABLED=true`
- Die UI-Lesequelle wird in diesem Step nicht auf DB umgestellt.

## Sicherheit

- Keine Upload-Funktion.
- Keine Edit-Funktion.
- Keine Delete-Funktion.
- Keine Online->Agent-Dateiaktionen.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine freien Pfade.
- `kind` wird serverseitig aus der Extension bestimmt.
- Erlaubte Roots bleiben `sounds`, `videos`, `images`.
- Erlaubte Extensions bleiben `.mp3`, `.wav`, `.ogg`, `.webm`, `.m4a`, `.mp4`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`.

## Status

Der Fortschritt ist im Agent-/Media-Status sichtbar:

- `state`
- `receivedChunks`
- `receivedItems`
- `totalItems`
- `lastChunkAt`
- `lastError`

## Grenzen

`/api/remote/media/status` nutzt online weiterhin Agent-Memory als primaere Lesequelle. Der DB-Read-Source-Step folgt separat als `RDAP_0.2.56_MEDIA_INDEX_READ_SOURCE`.
