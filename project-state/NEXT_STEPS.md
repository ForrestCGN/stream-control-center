# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.69

`RDAP_0.2.70_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_CODE_PLAN`

## Ziel

- Konkreten Source-Aenderungsplan fuer `backend/modules/remote_agent.js` erstellen.
- Neues Media-System `assets/media/<module>/<category>` in den Remote-Agent-Media-Scan aufnehmen.
- Legacy-Roots `assets/sounds`, `assets/videos`, `assets/images` weiter read-only erhalten.
- Inventory-Items um sortierbare Dashboard-Felder planen:
  - `source`
  - `moduleKey`
  - `categoryKey`
  - `fullCategoryKey`
  - `rootKey`
  - `type/kind`
- Remote-Modboard/Remote-Index kompatibel halten.
- Keine bestehenden Dateien verschieben oder loeschen.
- Keine Testdatei anlegen.
- Kein DB-Write.
- Keine Gates.
- Kein Tombstone-Execute.

## Ausgangspunkt

Neues Media-System:

```text
D:\Streaming\stramAssets\htdocs\assets\media\<module>\<category>\...
```

Spaeterer Test-Kontext:

```text
moduleKey: rdap-test
categoryKey: persistent-tombstone
fullCategoryKey: rdap-test/persistent-tombstone
```

Geplanter spaeterer Testpfad:

```text
media/rdap-test/persistent-tombstone/rdap-persistent-tombstone-test-001.mp3
```

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
