# NEXT_STEPS

## Naechster Schritt

`RDAP_0.2.56_MEDIA_INDEX_READ_SOURCE`

Ziel:
- bestaetigten DB-Index `remote_media_index` als Read-Source vorbereiten/nutzen
- Online-UI soll danach nicht mehr auf 120 Compact-Items begrenzt sein
- nur Lesen aus DB, keine Upload/Edit/Delete-Funktion
- keine Datei-Inhalte, keine absoluten Pfade

## Danach

- Delta-Sync / Loeschstatus separat planen
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates
