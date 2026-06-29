# RDAP 0.2.54A - Media Agent Inventory Source Fix

## Zweck

Hotfix auf 0.2.54 fuer den lokalen Remote-Agent-Media-Inventory-Pfad.

## Problem

`/api/remote-agent/media/inventory/status` konnte lokal mit `ReferenceError: source is not defined` abbrechen. Ursache war eine falsche `source`-Referenz in `preparedMediaInventory()`.

## Aenderung

- `backend/modules/remote_agent.js` korrigiert.
- `syncFoundation` wird in `preparedMediaInventory()` aus vorhandenen Parametern gebaut.
- Lokale Media-Inventory-Statusroute kann wieder antworten.
- Agent kann wieder Media-Inventory-Frames fuer den Online-Memory-Sync bauen/senden.

## Sicherheit

Keine DB-Writes, keine Schema-Writes, keine Datei-Writes, keine Upload/Edit/Delete-Funktion, keine Agent-Aktionen, keine Datei-Inhalte, keine absoluten Pfade.

## Sync-Verstaendnis

Aktueller Stand nach 0.2.54A:

1. Lokal ist der Stream-PC weiterhin Datei-Wahrheit.
2. Der lokale Agent scannt read-only die erlaubten Media-Roots.
3. Der Agent sendet aktuell noch einen kompakten Memory-Frame per WSS an den Webserver.
4. Das Online-Modboard liest `/api/remote/media/status`.
5. `/api/remote/media/status` liest aktuell noch aus dem Server-Agent-Memory, nicht aus `remote_media_index`.
6. `remote_media_index` ist vorbereitet und schema-kompatibel, wird aber noch nicht als Media-Lesequelle genutzt und noch nicht mit Media-Daten befuellt.

Naechster Funktionsschritt bleibt Full-Sync-Chunk-Receiver mit expliziten Gates.
