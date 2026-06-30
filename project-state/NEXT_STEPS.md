# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.71

`RDAP_0.2.72_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_WIRING`

## Ziel

- `backend/modules/remote_agent.js` minimal verdrahten.
- Helper `backend/modules/helpers/helper_media_inventory_roots.js` verwenden.
- Neues Media-System `assets/media/<module>/<category>` in den Remote-Agent-Media-Scan aufnehmen.
- Legacy-Roots `assets/sounds`, `assets/videos`, `assets/images` weiter read-only erhalten.
- Inventory-Items um sortierbare Dashboard-Felder ergaenzen:
  - `source`
  - `moduleKey`
  - `categoryKey`
  - `fullCategoryKey`
  - `assetRelativePath`
  - `webPath` / `publicPath`
- Remote-Modboard/Remote-Index kompatibel halten.
- Keine bestehenden Dateien verschieben oder loeschen.
- Keine Testdatei anlegen.
- Kein DB-Write.
- Keine Gates.
- Kein Tombstone-Execute.

## Weiterhin verboten ohne separaten Ausfuehrungs-Go

```text
- keine Testdatei anlegen
- keine lokale Datei verschieben
- keine lokale Datei loeschen
- keine DB-Zeile veraendern
- keine Gates aktivieren
- keinen echten Tombstone-Write ausfuehren
- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Blind-Auto-Sync
```
