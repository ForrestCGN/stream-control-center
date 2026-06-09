# STEP LWG-4N.8 – Bound-Wheel Fields Response Alias

## Ziel
Der Bound-Wheel-Felder-Endpunkt soll kompatibler antworten, damit Shell-Tests, Dashboard und spätere UI-Komponenten wahlweise `rows` oder `fields` verwenden können.

## Geänderte Datei
- `backend/modules/loyalty_giveaways.js`

## Änderung
`listBoundWheelFields(...)` liefert jetzt zusätzlich zu `rows` auch:

- `fields`: Alias auf dieselbe Feldliste
- `fieldCount`: Alias auf `count`

Vorher:

```json
{
  "ok": true,
  "count": 2,
  "rows": []
}
```

Jetzt:

```json
{
  "ok": true,
  "count": 2,
  "fieldCount": 2,
  "rows": [],
  "fields": []
}
```

## Keine Logikänderung
- Keine Änderung am Spin-Verhalten
- Keine Änderung an Gewinnerlogik
- Keine Änderung an Mengenreduzierung
- Keine Änderung an globalen Presets
- Keine Funktionalität entfernt

## Test
```powershell
node -c .\backend\modules\loyalty_giveaways.js

$uid = "GIVEAWAY_UID"
$check = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/$uid/wheel/bound/fields"
$check.rows.Count
$check.fields.Count
$check.fieldCount
```

Erwartung: `rows.Count`, `fields.Count` und `fieldCount` zeigen dieselbe Anzahl.
