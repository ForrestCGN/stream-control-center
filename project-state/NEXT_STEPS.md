# NEXT_STEPS

## Naechster Schritt

`RDAP_0.2.58_MEDIA_INDEX_DIFF_DIAGNOSTIC_READONLY`

Ziel:
- Read-only Diff-Diagnose zwischen Agent-Snapshot und `remote_media_index` bauen.
- Agent sieht X, DB sieht Y, Unterschiede nur als sichere Counts/IDs/relative Pfade ausgeben.
- neue/geaenderte/fehlende/unveraenderte Dateien getrennt sichtbar machen.
- keine Upload/Edit/Delete-Funktion.
- keine Datei-Inhalte, keine absoluten Pfade.
- keine DB-Writes.

## Danach

- Gated Delta-Upsert separat planen.
- Tombstone/`deleted=1` fuer fehlende Dateien nur mit eigenem Gate, Confirm, Audit/Lock und Readback.
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates planen.
