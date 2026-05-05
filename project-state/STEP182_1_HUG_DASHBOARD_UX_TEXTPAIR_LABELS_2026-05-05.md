# STEP182.1 - Hug Dashboard UX Textpaar Labels

Stand: 2026-05-05

## Ziel

Kleiner UX-Feinschliff fuer den Hug/Rehug-Textpaar-Editor im Dashboard.

## Anlass

Feedback aus Live-Screenshot:

- Die Ueberschrift `Text X / Antwort X` wirkt unnoetig sperrig.
- Fuer gekoppelte Eintraege ist `Textpaar X` verstaendlicher.
- Kleine Felder wie `Aktiv`, `Gewichtung` und `Sortierung` wirken zu breit.
- Dropdowns/kleine Eingaben sollen kompakter dargestellt werden.

## Geaenderte Dateien

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`

## Umsetzung

### hug.js

- Kartenkopf von `Text X / Antwort X` auf `Textpaar X` geaendert.
- Zusatzhinweis im Kartenkopf:
  - `Text und Antwort bleiben gekoppelt`
- Button im Neuformular von `Paar speichern` auf `Textpaar speichern`
- Kleine Formularfelder mit Kompakt-Klassen versehen:
  - `compact-aktiv`
  - `compact-weight`
  - `compact-sort`

### hug.css

- Grid fuer `.hug-pair-form` auf drei kompaktere Spalten reduziert.
- Kleine Felder erhalten begrenzte Max-Breiten.
- Responsive Verhalten bleibt erhalten.
- Suchfeld bleibt bewusst breiter.

## Bewusst nicht geaendert

- Keine Backend-Aenderung
- Keine API-Aenderung
- Keine DB-Aenderung
- Keine Aenderung an der Textpaar-Logik

## Test

- `node -c htdocs/dashboard/modules/hug.js`

## Erwartetes Ergebnis

- Kartenkopf zeigt `Textpaar X`
- Dropdown `Aktiv` wirkt kompakter
- `Gewichtung` und `Sortierung` wirken nicht mehr ueberbreit
- Text und Antwort bleiben visuell klar als Paar erkennbar
