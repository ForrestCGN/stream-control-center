# STEP276E_FIX1 – Alert Legacy-Sound Foldout Layout-Fix

## Ziel

Der eingeklappte Bereich „Alter Sound / Fallback“ soll sauber lesbar sein und den aktuellen alten Sound nicht gequetscht neben die Überschrift schreiben.

## Änderung

- Summary-Zeile nutzt jetzt eine eigene `legacy-sound-summary`-Klasse.
- Der alte Sound wird als „Aktuell: …“ mit sauberem Abstand angezeigt.
- Der Hinweis im aufgeklappten Bereich wurde gekürzt.
- Keine Speicherlogik geändert.
- Media-Registry-Sound hat weiterhin Vorrang.
- Legacy-Sound bleibt weiterhin Fallback.

## Tests

- `node --check htdocs/dashboard/modules/alerts.js` erfolgreich.
