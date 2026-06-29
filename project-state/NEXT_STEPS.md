# NEXT_STEPS

## Naechster technischer Schritt

`RDAP_0.2.54_MEDIA_INDEX_FULL_SYNC_TO_DB`

Ziel:

- Online-Media-Index persistent in MariaDB.
- Full-Sync in Chunks vom Agent zur Online-DB.
- Remote-Modboard liest online aus dem DB-Index statt aus dem Memory-Compact-Stand.
- Danach Delta-Sync und Online -> Agent-Auftragsqueue.

## Grenzen

- Keine Upload/Edit/Delete-Buttons ohne separaten Permission-/Audit-/Confirm-Step.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
