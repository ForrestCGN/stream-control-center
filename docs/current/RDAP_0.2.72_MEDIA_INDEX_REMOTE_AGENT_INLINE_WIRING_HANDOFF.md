# RDAP 0.2.72 - Media Index Remote-Agent Inline Wiring Handoff

## Ergebnis

0.2.72 dokumentiert den aktuellen Zwischenstand nach Entscheidung fuer Variante B:

- Der vorherige Helper `backend/modules/helpers/helper_media_inventory_roots.js` wurde aus GitHub/dev entfernt.
- `backend/modules/remote_agent.js` ist noch nicht inline erweitert.
- Der naechste Source-Step muss die Root-/Kategorie-Logik direkt in `remote_agent.js` einbauen.

## Live-Hinweis

GitHub/dev ist die Quelle fuer den naechsten Deploy. Die Helper-Datei ist in GitHub/dev entfernt.

Auf dem Live-Webserver unter `/opt/stream-control-center` ist die Datei erst dann sicher entfernt, wenn ein Webserver-Deploy aus frischem GitHub/dev-Clone erfolgt. Da der Helper nie von `remote_agent.js` required/verdrahtet wurde, hat ein eventuell noch vorhandenes Live-File keine Runtime-Wirkung.

## Ziel fuer den naechsten Source-Step

`backend/modules/remote_agent.js` soll direkt erweitert werden:

```text
- neues Media-System: htdocs/assets/media/<module>/<category>/...
- Legacy weiter: htdocs/assets/sounds, htdocs/assets/videos, htdocs/assets/images
```

Neue Media-System-Items sollen im Agent-Inventar diese Felder transportieren:

```text
source: media_dir
rootKey: media
moduleKey
categoryKey
fullCategoryKey
assetRelativePath
relativePath
webPath/publicPath
kind/mediaType
```

Legacy-Items sollen weiter kompatibel bleiben und zusaetzliche Sortierfelder bekommen:

```text
source: legacy_scan
rootKey: sounds|videos|images
moduleKey: legacy
categoryKey
fullCategoryKey: legacy/<categoryKey>
assetRelativePath
relativePath
webPath/publicPath
kind/mediaType
```

## Sicherheit

```text
keine Testdatei
keine lokale Dateiaktion
keine DB-Aenderung
keine Migration
keine Gates
kein Tombstone-Execute
kein Hard-Delete
kein physisches Loeschen
kein Online->Agent-Trigger
kein Blind-Auto-Sync
```

## Naechster Block

```text
RDAP_0.2.73_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_INLINE_WIRING
```

Ziel:

```text
backend/modules/remote_agent.js direkt erweitern, assets/media/<module>/<category> zusaetzlich read-only scannen, Legacy behalten, Kategorie-/Sortierfelder mitgeben.
```
