Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Repository: `ForrestCGN/stream-control-center`, Branch `dev`.

Aktueller Stand: `0.2.55A - Media Full-Sync Blocked-State Clarity`.

Wichtige Regeln:

1. Erst GitHub/dev und Doku-/State-Dateien lesen.
2. Dann relevante Source-Dateien lesen.
3. Dann Plan nennen.
4. Auf `go` warten.
5. ZIP mit echten Zielpfaden bauen, kein Wrapper-Ordner.
6. Keine Secrets.
7. Keine unbestaetigten DB-/Schema-/Media-Datenwrites.
8. Upload/Edit/Delete bleiben deaktiviert, bis separater Permission-/Audit-/Confirm-Step existiert.

Status:

- 0.2.55 hat Agent-Full-Sync-Chunks und den Remote-Chunk-Receiver eingefuehrt.
- Der Agent sendet weiterhin zusaetzlich den kompakten 120er Memory-Frame.
- Der Webserver kann Full-Sync-Chunks empfangen und streng validieren.
- DB-Writes nach `remote_media_index` erfolgen nur, wenn `MEDIA_INDEX_WRITE_ENABLED=true`, `MEDIA_INDEX_DATA_WRITE_ENABLED=true` und `MEDIA_INDEX_FULL_SYNC_ENABLED=true` aktiv sind.
- 0.2.55A korrigiert nur die Status-Semantik: vollstaendig empfangene, aber gate-blockierte Syncs werden als `received_write_blocked` angezeigt, nicht mehr als `pending`.
- Online-Modboard liest aktuell weiter aus Agent-Memory via `/api/remote/media/status`.
- DB-Index ist noch nicht aktive Media-Lesequelle.

Naechster Schritt:

`RDAP_0.2.56_MEDIA_INDEX_READ_SOURCE`

Ziel:

- Remote-Modboard-Media-Lesequelle kontrolliert auf `remote_media_index` umstellen.
- DB-Reads read-only ueber die bestehende Remote-Modboard-MariaDB-Schicht.
- Agent-Memory als Fallback/Status sichtbar halten.
- Keine Upload/Edit/Delete-Funktion.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Online->Agent-Dateiaktionen.
