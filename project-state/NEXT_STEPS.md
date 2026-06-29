# Next Steps

Nach `0.2.30`:

## 1. Direkt testen

```text
RDAP_0.2.30_STOP_AND_INVENTORY_NO_CODE
```

Pruefen:

```text
- START_HERE verweist auf 0.2.30 Stop and Inventory No Code.
- CURRENT_STATUS/NEXT_STEPS/TODO/FILES/CHANGELOG sind aktualisiert.
- Keine Runtime-Dateien wurden geaendert.
- Keine neuen Runtime-Dateien wurden erstellt.
- Keine DB-Migration wurde eingefuehrt.
- Kein Webserver-Deploy noetig, weil Doku-only.
```

## 2. Danach zwingend vor jedem Code-Step

```text
RDAP_0.2.31_MEDIA_8080_3010_FILE_MODULE_INVENTORY_NO_CODE
```

Ziel:

```text
- Echte Dateien aus GitHub/dev oder Source-ZIP lesen.
- Lokale 8080-Verantwortung dokumentieren.
- Server-3010-Verantwortung dokumentieren.
- Doppelte Media-Logik markieren.
- Altlasten/Plan-Dateien markieren.
- Festlegen, welche bestehende Datei spaeter geaendert werden darf.
- Neue Runtime-Dateien standardmaessig verbieten.
```

Mindestens inventarisieren:

```text
backend/modules/local_remote_modboard_adapter.js
backend/modules/remote_agent.js
backend/core/database.js
backend/modules/sqlite_core.js
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/app.js
remote-modboard/backend/server.js
```

## 3. Danach spaeter sinnvoll, aber nur nach Inventory

```text
RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_FOUNDATION
```

Ziel:

```text
- Vor Code echte Storage-/DB-Dateien aus GitHub/dev lesen.
- Vorhandene Projekt-DB/Helper bevorzugen.
- Keine Parallelstruktur bauen.
- Kleinste read-only Foundation fuer persistenten Media-Metadaten-Index planen.
- Server speichert hoechstens Metadaten, keine Datei-Inhalte.
- Lokal bleibt Master fuer echte Media-Dateien.
- Agent-Snapshot darf Server-Index aktualisieren, aber keine lokalen Dateien veraendern.
- Upload/Edit/Delete bleiben false.
- Migration nur nach eigenem bestaetigten Plan.
- Neue Runtime-Datei nur nach ausdruecklicher Forrest-Freigabe.
```

## 4. Danach spaeter

```text
RDAP_0.2.33_MEDIA_INDEX_DELTA_SYNC_READONLY
```

Ziel:

```text
- Snapshot/Deltas fuer Media-Index effizienter machen.
- Reconnect bringt Server-Index auf Stand.
- geloeschte lokale Dateien als deleted/stale markieren, nicht ungeprueft hart loeschen.
- weiterhin keine Datei-Writes.
```

## 5. Nicht tun

```text
Keine Technikmodule in Navigation anlegen.
Kein media-agent-sync Modul.
Kein OBS-Inventory-Protokoll fuer Media missbrauchen.
Keine Upload-/Delete-Buttons aktivieren.
Keine lokalen absoluten Pfade anzeigen.
Keine grossen Listen ohne Limit/Paging laden.
Keine DB-Migration ohne eigenen bestaetigten Step.
Keine bidirektionale Datei-Synchronisation ohne Sicherheitsmodell.
Keine Agent-Apply-Queue ohne Permission, Confirm, Audit, Backup und Conflict-Handling.
Keine neue Runtime-Datei als Standardloesung.
```

## 6. Standard-Arbeitsweise Zusatz

```text
Wenn GitHub/dev per Connector unvollstaendig/abgeschnitten ist:
- Sammel-Script fuer Source-Dateien liefern.
- Source-ZIP vom Nutzer abwarten.
- Erst aus Source-ZIP echten Step-ZIP bauen.
- ZIP fuer Installation muss echte Zielpfade enthalten, keinen Wrapper-Ordner.

Check-Ausgaben:
- Keine vollen JSON-Waende als Standard.
- Webserver: `curl ... | jq '{kurze:Felder}'`.
- Windows lokal: PowerShell `Invoke-RestMethod` + `[pscustomobject]`.
```
