# RDAP 0.2.56 - Media Index Read Source

## Ziel

Die Online-Media-Statusroute nutzt den bestaetigten persistenten Media-Index `remote_media_index` als primaere read-only Quelle. Dadurch ist die Online-Ansicht nicht mehr auf den kompakten 120er Agent-Memory-Frame begrenzt.

## Umsetzung

- `remote-modboard/backend/src/routes/media-readonly.routes.js`
  - liest online automatisch `remote_media_index`, wenn Schema kompatibel und `itemCount > 0`
  - nutzt Agent-Memory weiterhin als Fallback
  - erlaubt Agent-Memory-Diagnose ueber `?source=agent`
  - liest Media-Items nur per read-only DB-Verbindung
  - sanitisiert DB-Zeilen erneut vor Response-Ausgabe
  - setzt `sourceInfo.primary = remote_media_index`
  - meldet DB-Read-Source in `syncInfo`, `syncFoundation` und `onlineIndexTarget`

- `remote-modboard/backend/src/routes/routes.routes.js`
  - Routenbeschreibung auf 0.2.56 DB-Read-Source aktualisiert

## Sicherheit

- Keine Upload/Edit/Delete-Funktion
- Keine Datei-Inhalte
- Keine absoluten Pfade
- Keine aktiven MEDIA_INDEX-Writes
- Keine Online->Agent-Dateiaktionen
- Nur read-only SELECTs aus `remote_media_index`

## Erwarteter Zustand

- `remote_media_index` enthaelt 333 Items
- `/api/remote/media/status` liefert online `inventory.source = remote_media_index_readonly`
- `inventory.counts.returned = 333`
- `sourceInfo.primary = remote_media_index`
- `writeGate.activeWrites = false`
