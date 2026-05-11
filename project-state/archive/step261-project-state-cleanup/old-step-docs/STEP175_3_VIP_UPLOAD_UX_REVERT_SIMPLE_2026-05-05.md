# STEP175.3 VIP Upload-UX zurückgenommen / vereinfacht

Stand: 2026-05-05

## Grund

Der erste STEP175.3-Entwurf hat den Upload-Bereich zu groß und verwirrend gemacht.
Die Darstellung mit zusätzlicher Ziel-User-/Ziel-Datei-/Erlaubt-Box wurde verworfen.

## Änderung

- `htdocs/dashboard/modules/vip.js` zurück auf den bewährten STEP175.2-Stand.
- `htdocs/dashboard/modules/vip.css` zurück auf den bewährten STEP175.2-Stand.
- Sound-Vorschau-Buttons aus STEP175.2 bleiben erhalten.
- Upload-Bereich bleibt wieder schlank wie vorher.

## Bewusst nicht geändert

- Keine Backend-Routen geändert.
- Keine Datenbank geändert.
- Keine Berechtigungslogik geändert.
- Keine Sound-System-Queue-Logik geändert.

## Ergebnis

STEP175.3 wird nicht als Funktionsausbau übernommen. Der nächste mögliche Upload-UX-Schritt muss kleiner geplant werden:

- nur bessere Fehlermeldung beim Ersetzen ohne Checkbox
- keine großen zusätzlichen Upload-Infoboxen
- keine doppelte Statusdarstellung
