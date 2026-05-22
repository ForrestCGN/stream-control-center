# STEP_BIRTHDAY_005C – Birthday Queue Duplicate Response Fix

## Ziel

Fix fuer die Birthday-Show-Queue nach STEP_BIRTHDAY_005B.

## Problem

- Ein doppelter `!birthday party <user>` wurde fachlich korrekt blockiert, aber das Modul gab `ok:false` zurueck.
- Das zentrale Command-System wertete das als HTTP-400-Zielfehler (`target_http_400`) statt als normale Chat-Antwort.
- Einige Party-Texte konnten leer bleiben, wenn in DB-Textvarianten noch keine aktiven Varianten fuer neue Keys vorhanden waren.

## Aenderungen

- `party_duplicate` wird jetzt als erwarteter Block mit `ok:true`, `blocked:true`, `duplicate:true` zurueckgegeben.
- `renderText()` nutzt jetzt robuste Fallbacks, wenn `renderModuleText()` leer zurueckgibt.
- Default-Texte fuer `party_queued` und `party_duplicate` ergaenzt.
- Step-Marker auf `STEP_BIRTHDAY_005C` gesetzt.

## Betroffene Dateien

- `backend/modules/birthday.js`

## Tests

```powershell
node --check backend\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue"
```

Doppeltest:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday party araglor","userLogin":"forrestcgn","displayName":"ForrestCGN"}'
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday party araglor","userLogin":"forrestcgn","displayName":"ForrestCGN"}'
```

Erwartung: zweiter Aufruf liefert keine `target_http_400`-Exception, sondern eine normale Block-Antwort.
