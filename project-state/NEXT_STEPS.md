# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.68

`RDAP_0.2.69_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_PLAN`

## Ziel

- `backend/modules/media.js` und `backend/modules/remote_agent.js` gemeinsam lesen.
- Plan erstellen, wie der Remote-Agent das neue Media-System `assets/media/<module>/<category>` fuer den RDAP-Remote-Index beruecksichtigt.
- Legacy-Roots `assets/sounds`, `assets/videos`, `assets/images` weiter read-only erhalten.
- Neue Media-System-Dateien fuer den Remote-Index sichtbar machen.
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
