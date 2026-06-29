# Next Steps

Nach `0.2.27`:

## 1. Direkt testen

```text
RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY
```

Pruefen:

```text
- Lokal Media-Inventar weiterhin aktiv.
- Agent-Verbindung online aktiv.
- Online /api/remote/agent/media/inventory/status zeigt Agent-Media-Memory-Cache.
- Online /api/remote/media/status uebernimmt Media-Inventar aus Agent-Memory.
- Counts lokal/online plausibel.
- upload/edit/delete bleiben false.
- Keine absoluten Pfade in Online-Response.
- Payload-Limit/Truncated bleibt stabil.
```

## 2. Danach sinnvoll

```text
RDAP_0.2.28_MEDIA_AGENT_SLOW_SYNC_STATUS_POLISH_READONLY
```

Ziel:

```text
- Sichttest Media-Seite lokal/online.
- Kleine UI-Statusverfeinerung nur falls noetig.
- Keine Writes.
- Keine Uploads/Deletes/Edits.
- Keine DB-Migration.
```

## 3. Nicht tun

```text
Keine Technikmodule in Navigation anlegen.
Kein media-agent-sync Modul.
Kein OBS-Inventory-Protokoll fuer Media missbrauchen.
Keine Upload-/Delete-Buttons aktivieren.
Keine lokalen absoluten Pfade anzeigen.
Keine grossen Listen ohne Limit/Paging laden.
Keine Rechte-/Rollenfragen nach hinten schieben.
```

## 4. Standard-Arbeitsweise Zusatz

```text
Wenn GitHub/dev per Connector unvollstaendig/abgeschnitten ist:
- Sammel-Script fuer Source-Dateien liefern.
- Source-ZIP vom Nutzer abwarten.
- Erst aus Source-ZIP echten Step-ZIP bauen.
- ZIP fuer Installation muss echte Zielpfade enthalten, keinen Wrapper-Ordner.
```
