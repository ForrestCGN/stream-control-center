# Neuer Chat Prompt - nach RDAP 0.2.53B

Projekt: `ForrestCGN/stream-control-center`, Branch `dev`.

Aktueller Stand: `0.2.53B - Media Sync Card replaces Hinweis`.

Wichtig:

- Media-Bereiche und Media-Synchronisierung stehen oben nebeneinander.
- Medienliste ist darunter full-width.
- Hinweis-Karte wurde entfernt; Read-only bleibt kompakt sichtbar.
- 0.2.53/0.2.53A/0.2.53B sind Foundation/UI-Schritte, keine produktiven DB-Writes.

Naechster technischer Schritt:

`RDAP_0.2.54_MEDIA_INDEX_FULL_SYNC_TO_DB`

Ziel: Online-Media-Index in MariaDB, Full-Sync in Chunks vom Agent zur Online-DB, Remote-Modboard liest online aus DB-Index. Keine Datei-Inhalte, keine absoluten Pfade, keine Upload/Edit/Delete-Buttons ohne separaten Permission-/Audit-/Confirm-Step.

Workflow bleibt verbindlich: GitHub/dev und Docs lesen, Plan nennen, auf `go` warten, ZIP mit echten Zielpfaden bauen.
