Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Repository: `ForrestCGN/stream-control-center`, Branch `dev`.

Aktueller Stand: `0.2.55 - Media Full-Sync Chunk Receiver`.

Wichtige Regeln:

1. Erst GitHub/dev und Doku-/State-Dateien lesen.
2. Dann Plan nennen.
3. Auf `go` warten.
4. ZIP mit echten Zielpfaden bauen, kein Wrapper-Ordner.
5. Keine Secrets.
6. Keine unbestaetigten DB-/Schema-/Media-Datenwrites.
7. Upload/Edit/Delete bleiben deaktiviert, bis separater Permission-/Audit-/Confirm-Step existiert.

Status:

- 0.2.54 hat Media-Index-Write-Gates und Schema-Status vorbereitet.
- 0.2.54A fixt den lokalen Agent-Media-Inventory-Pfad.
- 0.2.55 erweitert Agent und Remote-Agent-Runtime um Full-Sync-Chunks.
- Server schreibt Media-Index-Daten nur bei aktiven Gates:
  - `MEDIA_INDEX_WRITE_ENABLED=true`
  - `MEDIA_INDEX_DATA_WRITE_ENABLED=true`
  - `MEDIA_INDEX_FULL_SYNC_ENABLED=true`
- `/api/remote/media/status` zeigt Full-Sync-Status, bleibt aber als UI-Lesequelle bei Agent-Memory.
- `remote_media_index` kann durch Chunks befuellt werden, wenn die Gates aktiv sind.

Naechster Schritt:

`RDAP_0.2.56_MEDIA_INDEX_READ_SOURCE`

Ziel:

- Remote-Modboard-Media-Lesequelle kontrolliert von Agent-Memory auf `remote_media_index` umstellen.
- Nur read-only DB-Reads.
- Fallback/Status sauber sichtbar machen.
- Keine Upload/Edit/Delete-Funktion.
