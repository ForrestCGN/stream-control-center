Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Repository: `ForrestCGN/stream-control-center`, Branch `dev`.

Aktueller Stand: `0.2.54A - Media Agent Inventory Source Fix`.

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
- `remote_media_index` wurde auf dem Webserver read-only als vorhanden und kompatibel erkannt.
- 0.2.54A fixt im lokalen Agent `ReferenceError: source is not defined` in `preparedMediaInventory()`.
- Der lokale Agent kann danach `/api/remote-agent/media/inventory/status` wieder liefern und Media-Inventory-Frames bauen.
- Online-Modboard liest aktuell weiter aus Agent-Memory via `/api/remote/media/status`.
- DB-Index ist noch nicht aktive Media-Lesequelle.
- Full-Sync-Chunk-Receiver ist naechster Schritt.

Naechster Schritt:

`RDAP_0.2.55_MEDIA_FULL_SYNC_CHUNK_RECEIVER`

Ziel:

- Agent sendet Media-Inventar in Chunks.
- Server nimmt Chunks an.
- Server schreibt nur bei `MEDIA_INDEX_WRITE_ENABLED=true`, `MEDIA_INDEX_DATA_WRITE_ENABLED=true`, `MEDIA_INDEX_FULL_SYNC_ENABLED=true` und expliziten Confirm-/Protokoll-Gates in `remote_media_index`.
- Danach separater Step, um Online-Lesequelle kontrolliert auf DB-Index umzustellen.
