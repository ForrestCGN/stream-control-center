# RDAP 0.2.55B - Media Full-Sync Active Write Completion State

## Zweck

0.2.55B behebt einen Status-/Zaehler-Bug aus dem kontrollierten MEDIA_INDEX Full-Sync Write-Test.

Beim aktiven DB-Write konnten Full-Sync-Chunks asynchron fertig werden. Dadurch konnte ein spaeter fertig geschriebener, niedrigerer Chunk den Status wieder auf `chunk` zuruecksetzen, obwohl `remote_media_index` bereits alle Items enthielt.

## Aenderung

- Der Receiver zaehlt empfangene Chunk-Indizes als Set.
- `receivedChunks` zeigt jetzt die Anzahl eindeutiger empfangener/geschriebener Chunks.
- Bei vollstaendigem Empfang und aktivem Write wird `state: complete` gesetzt.
- `completedAt` bleibt gesetzt und wird nicht durch spaeter fertig werdende Chunks geloescht.
- Gate-blockierte Full-Syncs behalten `state: received_write_blocked`.

## Sicherheit

Keine Gate-Aktivierung, keine neuen DB-Writes, keine UI-Read-Source-Umstellung, keine Upload/Edit/Delete-Funktion, keine Datei-Inhalte, keine absoluten Pfade.
