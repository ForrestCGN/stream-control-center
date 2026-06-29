# RDAP 0.2.55A - Media Full-Sync Blocked-State Clarity

## Zweck

Gezielter Status-Fix fuer den in 0.2.55 eingefuehrten Media-Full-Sync-Chunk-Receiver.

## Problem

Der Webserver konnte alle Full-Sync-Chunks empfangen, zeigte bei deaktivierten MEDIA_INDEX-Gates aber weiter `state: pending`. Das war technisch unpraezise, weil der Empfang abgeschlossen war und nur der DB-Write bewusst blockiert wurde.

## Aenderung

- Bei deaktivierten MEDIA_INDEX-Gates wird ein noch laufender Empfang als `blocked_by_gate` angezeigt.
- Wenn alle Chunks und Items vollstaendig empfangen wurden, wird `state: received_write_blocked` gesetzt.
- `completedAt` wird fuer vollstaendig empfangene, aber gate-blockierte Syncs gesetzt.
- `lastError` enthaelt weiter den konkreten Gate-Grund, z. B. `media_index_write_gate_disabled`.

## Sicherheit

Keine DB-Writes aktiviert, keine ENV-Gates geaendert, keine Upload/Edit/Delete-Funktion, keine UI-Read-Source-Umstellung, keine Datei-Inhalte, keine absoluten Pfade, keine Online->Agent-Dateiaktionen.

## Erwarteter Status bei Gates aus

```json
{
  "state": "received_write_blocked",
  "receivedChunks": 7,
  "totalChunks": 7,
  "receivedItems": 333,
  "totalItems": 333,
  "lastError": "media_index_write_gate_disabled",
  "writesBlocked": true,
  "writeEnabled": false
}
```

## Naechster Schritt

`RDAP_0.2.56_MEDIA_INDEX_READ_SOURCE` bleibt der geplante naechste technische Schritt.
