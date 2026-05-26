# STEP_BIRTHDAY_005D – Started/Queued Message Fix

## Ziel

Korrigiert die Chat-/API-Rückmeldung beim Start einer Birthday-Show mit Sound-System-Bundle.

## Änderung

- Ein direkt gestartetes Birthday-Bundle wird als `started` gemeldet, auch wenn der zweite Bundle-Teil (Song) bereits in der Sound-System-Queue liegt.
- Echte Warteschlange bleibt nur dann `queued`, wenn bereits eine Birthday-Show aktiv ist oder das Sound-System das Bundle nicht sofort starten kann.
- `party_started`, `party_queued` und `party_duplicate` bleiben getrennte Antworten.
- Keine Änderung an Medien, Overlay, Party-Presets oder Sound-System-Queue-Mechanik.

## Dateien

- `backend/modules/birthday.js`

## Tests

```powershell
node --check backend\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
```

Erwartung: `step = STEP_BIRTHDAY_005D`.

Danach:

- erster `!birthday party araglor` → Startmeldung
- zweiter `!birthday party araglor` → Duplicate-/Blockmeldung
- anderer User während laufender Show → Queue-Meldung
