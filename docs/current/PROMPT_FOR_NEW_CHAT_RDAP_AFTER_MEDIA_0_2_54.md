Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Aktueller Stand nach diesem Step: `0.2.54 - Media Index Schema and Write Gate`.

Wichtige Regeln:

1. Erst GitHub/dev und Doku-/State-Dateien lesen.
2. Dann Plan nennen.
3. Auf `go` warten.
4. Erst dann ZIP bauen.
5. ZIP mit echten Zielpfaden, kein Wrapper-Ordner.
6. Keine Secrets.
7. Keine Funktionalitaet entfernen.

Stand:

- 0.2.53B hat die Media-UI korrigiert.
- 0.2.54 bereitet Media-Index-Write-Gates und Schema-Status vor.
- `remote_media_index` ist Ziel fuer den Online-Media-Index.
- Schema-Prepare ist local-only, confirm-geschuetzt und per ENV-Gates deaktiviert, bis bewusst aktiviert.
- Full-Sync-Datenwrites sind noch nicht aktiv.

Naechster sinnvoller Schritt:

`RDAP_0.2.55_MEDIA_INDEX_SCHEMA_PREPARE_CONFIRMED_OR_FULL_SYNC_CHUNK_RECEIVER`

Vor dem naechsten Schritt pruefen:

- `/api/remote/media/index/write-gate/status`
- `/api/remote/media/index/schema/status`
- `/api/remote/media/status?db=1`

Grenzen:

- Keine Upload/Edit/Delete-Buttons ohne separaten Permission-/Audit-/Confirm-Step.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Datenwrites erst, wenn Gate/Schema bewusst freigegeben und getestet sind.
