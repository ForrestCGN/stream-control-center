# TODO

## Aktiv

- [ ] `RDAP_0.2.34_MEDIA_PERSISTENT_INDEX_MIGRATION_FOUNDATION_READONLY` lokal einspielen.
- [ ] `node --check .\remote-modboard\backend\src\routes\media-readonly.routes.js`.
- [ ] Pruefen: `START_HERE_FOR_NEW_CHAT.md` zeigt aktuellen Stand 0.2.34.
- [ ] Pruefen: neue Step-Doku ist vorhanden.
- [ ] Pruefen: keine neue Runtime-Datei enthalten.
- [ ] Pruefen: Upload/Edit/Delete/Agent-Actions bleiben deaktiviert.
- [ ] Pruefen: `/api/remote/media/status` meldet persistentIndex.ok=true und schemaVersion=1.
- [ ] Wenn sauber: `stepdone.cmd`.

## Ergebnis 0.2.34

- [x] DB-Migration/Foundation fuer `remote_media_index` vorbereitet.
- [x] Bestehende DB-Schicht `backend/core/database.js` genutzt.
- [x] Media-Route bleibt read-only.
- [x] Keine Media-Daten-Writes aktiviert.
- [x] Kein DB-Fallback-Lesen aktiviert.

## Spaeter

- [ ] Sanitized Agent-Media-Snapshot in `remote_media_index` schreiben, nur nach eigenem Go.
- [ ] Stale/Fallback-Read aus DB planen, nur nach eigenem Go.
- [ ] Paging/Cursor separat planen.
- [ ] Upload/Edit/Delete weiter blockieren, bis Permission/Confirm/Audit/Readback fertig sind.
