# RDAP 0.2.56A - Media Sync Status DB Source UI

## Zweck

0.2.56 hatte die Online-Media-Quelle erfolgreich auf `remote_media_index` read-only umgestellt. Die Hauptinventar-Kachel zeigte dadurch 333 Medien, die Sync-Status-Karte zeigte aber noch den alten Compact-Agent-Fortschritt 120 / 334.

Dieser Step korrigiert nur das UI-/Status-Mapping.

## Aenderungen

- `remote-modboard/backend/public/assets/modules/media/library.js`
- `htdocs/dashboard-v2/assets/modules/media/library.js`

Die UI erkennt eine aktive DB-Read-Source ueber:

- `inventory.source === "remote_media_index_readonly"`
- oder `sourceInfo.primary === "remote_media_index"`
- oder `onlineIndexTarget.activeAsReadSource === true`

Bei aktiver DB-Read-Source nutzt die Sync-Karte die DB-Inventarzaehler:

- `returned`
- `totalSeen`
- `truncated`

Erwartete Anzeige:

- Online-DB aktiv
- 333 / 333 Dateien
- 100%
- Vollstaendig
- DB Read-only

## Sicherheit

- Keine DB-Writes.
- Keine Gate-Aktivierung.
- Keine Upload/Edit/Delete-Funktion.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Agent-Memory-Fallback bleibt unveraendert.
