# STEP182.2 - Hug Dashboard UX Textarea Width

Stand: 2026-05-05

## Ziel

Die Text- und Antwort-Textfelder im Hug/Rehug-Editor sollen die verfuegbare Kartenbreite besser nutzen.

## Anlass

Live-Feedback:

- Die Text-Eingabefelder wirken zu schmal.
- Die restliche Kartenbreite bleibt ungenutzt.
- Die kleinen Felder oben sollen kompakt bleiben, aber die Textareas duerfen breit sein.

## Geaenderte Dateien

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`

## Umsetzung

### hug.js

- Breite Textfelder mit zusaetzlicher Klasse `pair-textarea` markiert.
- Keine Fachlogik geaendert.

### hug.css

- `.hug-pair-form` nutzt jetzt eine zusaetzliche flexible Spalte:
  - `120px 150px 120px minmax(260px,1fr)`
- Dadurch bleiben die kleinen Felder kompakt.
- `Text` und `Antwort-Text` spannen weiterhin ueber die ganze Formbreite,
  jetzt aber ueber eine deutlich breitere Gesamtbreite.
- Responsive Verhalten fuer Tablet/Mobile bleibt erhalten.

## Bewusst nicht geaendert

- Keine Backend-Aenderung
- Keine API-Aenderung
- Keine DB-Aenderung
- Keine Aenderung an der Textpaar-Logik

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\hug.js
```

## Erwartetes Ergebnis

- Kleine Felder oben bleiben kompakt
- Text- und Antwort-Textfelder nutzen die Kartenbreite deutlich besser aus
- Der Editor wirkt ruhiger und weniger gequetscht
