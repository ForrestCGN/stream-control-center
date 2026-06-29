# NEXT_STEPS

## Naechster technischer Schritt

`RDAP_0.2.55_MEDIA_INDEX_SCHEMA_PREPARE_CONFIRMED_OR_FULL_SYNC_CHUNK_RECEIVER`

Ziel:

- Nach Status-/Gate-Pruefung remote_media_index Schema kontrolliert vorbereiten.
- Danach Full-Sync Chunk Receiver fuer Agent -> Online-DB bauen.
- Alle validen Media-Dateien in Chunks uebertragen, nicht als 120er Compact-Memory-Liste.
- Remote-Modboard liest online spaeter aus DB-Index statt aus Memory.

## Grenzen

- Keine Upload/Edit/Delete-Buttons ohne separaten Permission-/Audit-/Confirm-Step.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Online->Agent-Auftragsqueue erst nach stabilen Agent->Online-Syncs.
