# NEXT_STEPS

## Naechster RDAP-Block nach 0.2.74

`RDAP_0.2.75_MEDIA_INDEX_REMOTE_AGENT_FULL_SYNC_MEDIA_SYSTEM_VERIFY_READONLY`

## Ausgangslage

`RDAP_0.2.73_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_INLINE_WIRING` ist lokal bestaetigt und nach GitHub/dev gepusht.

Bestaetigt:

```text
moduleVersion    : 0.1.8E
moduleBuild      : RDAP_0.2.73_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_INLINE_WIRING
statusApiVersion : rdap_agent_media_inventory_media_system_scan_073.v1
readOnly         : True
writeEnabled     : False
```

0.2.74 ist nur Doku-/Handoff-Korrektur.

## Ziel fuer 0.2.75

- Lokal pruefen, ob `backend/modules/remote_agent.js` den neuen Root `media` sauber im Inventory ausgibt.
- Pruefen, ob Items aus `assets/media/<module>/<category>/...` die neuen Kontextfelder enthalten:
  - `source`
  - `moduleKey`
  - `categoryKey`
  - `fullCategoryKey`
  - `assetRelativePath`
  - `webPath`
  - `publicPath`
- Pruefen, ob Full-Sync-Chunks diese Felder weiterhin read-only transportieren.
- Pruefen, ob Remote-Modboard/Agent-Runtime die Felder nicht verwirft oder wegen Root `media` ablehnt.
- Falls Remote-Seite `media` noch nicht akzeptiert, separaten Remote-Code-Step planen.

## Relevante Dateien zuerst lesen

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
backend/modules/remote_agent.js
backend/modules/media.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
```

## Voraussichtliche Pruefungen

Lokal:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/media/inventory/status" |
  Select-Object moduleVersion,moduleBuild,statusApiVersion,readOnly,writeEnabled

Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/media/inventory/status" |
  Select-Object -ExpandProperty inventory |
  Select-Object -ExpandProperty roots
```

Nur wenn bereits echte Dateien unter `assets/media/<module>/<category>/...` vorhanden sind:

```powershell
$inv = Invoke-RestMethod "http://127.0.0.1:8080/api/remote-agent/media/inventory/status"
$inv.items |
  Where-Object rootKey -eq "media" |
  Select-Object -First 10 id,rootKey,source,moduleKey,categoryKey,fullCategoryKey,assetRelativePath,webPath,publicPath,kind,name
```

Remote nur Diagnose/read-only, falls Agent verbunden ist:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/agent/media/inventory/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq
```

## Weiterhin verboten ohne separaten Ausfuehrungs-Go

```text
- keine Testdatei automatisch anlegen
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
