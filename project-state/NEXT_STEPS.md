# NEXT_STEPS

## Naechster Schritt

Webserver-Diff nach 0.2.58F testen und Hard-/Soft-Counts bewerten.

Ziel:
- Erwartung pruefen: `hardChangedOnAgentCount = 0`, `softModifiedAtOnlyCount = 120`.
- Wenn nur Soft-Matches vorliegen, keine Upserts aus `modifiedAt` ableiten.
- Erst danach echten gated Delta-Upsert fuer harte Unterschiede planen.
- Kein Tombstone/Delete.

## Danach

- Gated Delta-Upsert separat planen.
- Tombstone/`deleted=1` fuer fehlende Dateien separat planen.
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates planen.
