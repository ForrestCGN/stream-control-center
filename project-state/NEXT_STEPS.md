# Next Steps

Nach `0.2.28`:

## 1. Direkt testen

```text
RDAP_0.2.28_MEDIA_AGENT_SLOW_SYNC_STATUS_POLISH_READONLY
```

Pruefen:

```text
- Remote-Modboard Media-Seite online zeigt Agent-Sync aktiv / kompakte Liste verstaendlich an.
- Lokal Media-Seite bleibt lokale Datei-Wahrheit.
- Online /api/remote/media/status meldet syncInfo.memoryOnly=true und syncInfo.serverPersistence=false.
- Online /api/remote/agent/media/inventory/status bleibt active=true, connected=true, rejects=null.
- truncated=true wird als gekuerzte kompakte Liste angezeigt, nicht als Fehler.
- upload/edit/delete bleiben false.
- Keine absoluten Pfade in Online-Response.
```

## 2. Danach sinnvoll

```text
RDAP_0.2.29_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN
```

Ziel:

```text
- Persistenten Server-Index nur planen, nicht blind bauen.
- Klaeren: SQLite/DB-Cache vs. JSON-Cache vs. bestehende DB-Struktur.
- Lokal bleibt Master fuer echte Media-Dateien.
- Server speichert hoechstens Metadaten-Index, keine Datei-Inhalte.
- Agent sendet spaeter Snapshot/Deltas und bringt Server-Index bei Reconnect auf Stand.
- Upload/Edit/Delete bleiben separate spaetere Steps mit Permission, Confirm, Audit, Conflict-Handling.
```

## 3. Nicht tun

```text
Keine Technikmodule in Navigation anlegen.
Kein media-agent-sync Modul.
Kein OBS-Inventory-Protokoll fuer Media missbrauchen.
Keine Upload-/Delete-Buttons aktivieren.
Keine lokalen absoluten Pfade anzeigen.
Keine grossen Listen ohne Limit/Paging laden.
Keine DB-Migration ohne eigenen bestaetigten Step.
Keine bidirektionale Datei-Synchronisation ohne Sicherheitsmodell.
```

## 4. Standard-Arbeitsweise Zusatz

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
