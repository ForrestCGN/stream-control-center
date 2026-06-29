# Next Steps

Nach `0.2.27B`:

## 1. Direkt testen

```text
RDAP_0.2.27B_MEDIA_SYNC_COMPACT_FRAME_FIX
```

Pruefen:

```text
- Lokal Media-Inventar weiterhin aktiv.
- Agent-Verbindung online bleibt nach Media-Sync verbunden.
- Webserver Reject `agent_payload_too_large_64bit_frame` tritt nicht mehr auf.
- Online /api/remote/agent/media/inventory/status zeigt Agent-Media-Memory-Cache.
- Online /api/remote/media/status uebernimmt Media-Inventar aus Agent-Memory.
- Counts lokal/online plausibel; online darf wegen Compact-Transport weniger Items melden.
- truncated darf true sein und ist kein Fehler.
- upload/edit/delete bleiben false.
- Keine absoluten Pfade in Online-Response.
```

## 2. Danach sinnvoll

```text
RDAP_0.2.28_MEDIA_AGENT_SLOW_SYNC_STATUS_POLISH_READONLY
```

Ziel:

```text
- Sichttest Media-Seite lokal/online.
- Kleine UI-Statusverfeinerung nur falls noetig.
- Optional Paging/Filter-Limit sauber planen.
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

Check-Ausgaben:
- Keine vollen JSON-Waende als Standard.
- Webserver: `curl ... | jq '{kurze:Felder}'`.
- Windows lokal: PowerShell `Invoke-RestMethod` + `[pscustomobject]`.
```
