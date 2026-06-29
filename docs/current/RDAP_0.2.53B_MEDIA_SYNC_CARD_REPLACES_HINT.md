# RDAP 0.2.53B - Media Sync Card replaces Hinweis

## Ziel

Der Media-Sync-Status ersetzt die bisherige Hinweis-Karte. Der Read-only-Hinweis bleibt nur noch kompakt sichtbar, waehrend der wertvollere Sync-Status an der rechten oberen Position steht.

## Geaendert

- `remote-modboard/backend/public/assets/modules/media/library.js`
- `htdocs/dashboard-v2/assets/modules/media/library.js`

## Ergebnis

- Oben: Media-Bereiche links, Media-Synchronisierung rechts.
- Darunter: Medienliste full-width.
- Keine eigene Hinweis-Karte mehr.
- Filter, Suche, Sortierung, Paging und Info-Fenster bleiben unveraendert.

## Sicherheit

Keine Backend-/API-/DB-Aenderungen, keine Writes, kein Upload/Edit/Delete.
