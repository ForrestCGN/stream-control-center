# Next Steps

Nach `0.2.31`:

## 1. Direkt testen

```text
RDAP_0.2.31_MEDIA_8080_3010_FILE_MODULE_INVENTORY_NO_CODE
```

Pruefen:

```text
- START_HERE verweist auf 0.2.31.
- Neue Doku-Datei ist vorhanden:
  docs/current/RDAP_0.2.31_MEDIA_8080_3010_FILE_MODULE_INVENTORY_NO_CODE.md
- CURRENT_STATUS/NEXT_STEPS/TODO/FILES/CHANGELOG sind aktualisiert.
- Keine Runtime-Dateien wurden geaendert.
- Keine neuen Runtime-Dateien wurden erstellt.
- Keine DB-Migration wurde eingefuehrt.
- Kein Webserver-Deploy noetig, weil Doku-only.
```

## 2. Danach zwingend vor jedem Code-Step

```text
Kein direkter Code-Step.
Erst bestaetigen, welche bestehende Datei geaendert werden darf.
```

Mindestentscheidung vor Code:

```text
- Soll Persistent Index ueber agent-runtime.service.js geschrieben werden?
- Soll media-readonly.routes.js nur lesen/fallbacken?
- Darf backend/core/database.js aus remote-modboard/backend sauber importiert werden?
- Gibt es bereits remote-modboard-eigene DB-Helfer, die stattdessen gelesen werden muessen?
- Ist eine DB-Migration erlaubt? Wenn ja: eigener Migration/Foundation-Step.
- Neue Runtime-Datei: nein, ausser Forrest genehmigt sie ausdruecklich.
```

## 3. Danach spaeter sinnvoll, aber nur als Plan zuerst

```text
RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_FOUNDATION_PLAN
```

Ziel:

```text
- Kein Code im ersten 0.2.32-Schritt.
- Exakt festlegen, welche bestehenden Dateien betroffen waeren.
- Exakt klaeren, ob DB-Migration noetig ist.
- Exakt klaeren, ob backend/core/database.js im Server-Kontext sauber nutzbar ist.
- Keine Parallelstruktur bauen.
- Keine neue Runtime-Datei als Standardloesung.
```

## 4. Danach spaeter Code nur nach gesondertem Go

```text
RDAP_0.2.33_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_FOUNDATION
```

Ziel:

```text
- Vorhandene Projekt-DB/Helper bevorzugen.
- Kleinste read-only Foundation fuer persistenten Media-Metadaten-Index.
- Server speichert hoechstens Metadaten, keine Datei-Inhalte.
- Lokal bleibt Master fuer echte Media-Dateien.
- Agent-Snapshot darf Server-Index aktualisieren, aber keine lokalen Dateien veraendern.
- Upload/Edit/Delete bleiben false.
- Migration nur nach eigenem bestaetigten Plan.
- Neue Runtime-Datei nur nach ausdruecklicher Forrest-Freigabe.
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
