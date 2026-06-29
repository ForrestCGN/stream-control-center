# Next Steps

Nach `0.2.29`:

## 1. Direkt testen

```text
RDAP_0.2.29_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN
```

Pruefen:

```text
- Doku/Plan-Datei ist vorhanden: docs/current/MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN_0.2.29.md
- START_HERE verweist auf 0.2.29 und den Persistent-Index-Plan.
- CURRENT_STATUS/NEXT_STEPS/TODO/FILES/CHANGELOG sind aktualisiert.
- Keine Runtime-Dateien wurden geaendert.
- Keine DB-Migration wurde eingefuehrt.
- Kein Webserver-Deploy noetig, weil Doku-only.
```

## 2. Danach sinnvoll

```text
RDAP_0.2.30_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_FOUNDATION
```

Ziel:

```text
- Vor Code echte Storage-/DB-Dateien aus GitHub/dev lesen.
- Klaeren und bevorzugen: vorhandene Projekt-DB/Helper statt Parallelstruktur.
- Kleinste read-only Foundation fuer persistenten Media-Metadaten-Index planen.
- Server speichert hoechstens Metadaten, keine Datei-Inhalte.
- Lokal bleibt Master fuer echte Media-Dateien.
- Agent-Snapshot darf Server-Index aktualisieren, aber keine lokalen Dateien veraendern.
- Upload/Edit/Delete bleiben false.
- Migration nur nach eigenem bestaetigten Plan.
```

## 3. Danach spaeter

```text
RDAP_0.2.31_MEDIA_INDEX_DELTA_SYNC_READONLY
```

Ziel:

```text
- Snapshot/Deltas fuer Media-Index effizienter machen.
- Reconnect bringt Server-Index auf Stand.
- geloeschte lokale Dateien als deleted/stale markieren, nicht ungeprueft hart loeschen.
- weiterhin keine Datei-Writes.
```

## 4. Nicht tun

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
```

## 5. Standard-Arbeitsweise Zusatz

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
