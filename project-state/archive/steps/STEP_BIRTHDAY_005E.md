# STEP_BIRTHDAY_005E – Birthday Queue Stale Cleanup

## Ziel
Behebt hängende Birthday-Queue-Einträge, die nach Sound-System-Reset/Backend-Neustart als `queued` stehen bleiben, obwohl keine Birthday-Show mehr aktiv ist und das Sound-System keine Birthday-Bundles mehr enthält.

## Änderungen

### Backend
- `backend/modules/birthday.js`
  - Step auf `STEP_BIRTHDAY_005E` gesetzt.
  - Stale-Cleanup für `birthday_show_queue` ergänzt.
  - Vor jedem neuen `!birthday party <user>` wird geprüft, ob alte Queue-Einträge ohne aktive Show/Sound-System-Bundle hängen.
  - `/api/birthday/show/queue` bereinigt hängende Einträge automatisch, wenn das Sound-System leer ist.
  - Neue Admin-/Debug-Route:
    - `POST /api/birthday/show/queue/clear-stale`

## Verhalten
- Wenn `show.active=false` und das Sound-System keine Birthday-Arbeit mehr hat, werden alte `queued/submitted/active/running` Einträge als `stale` markiert.
- Danach blockieren diese Einträge keine neuen Geburtstagsshows mehr.
- Wenn das Sound-System noch ein Birthday-Bundle in `current`, `queue`, `bundles` oder `activeBundleLock` hat, wird nichts bereinigt.

## Tests
```powershell
node --check backend\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue/clear-stale" -Method POST -ContentType "application/json" -Body '{}'
```

## Ergebnis
Birthday-Queue-Dedupe bleibt aktiv, aber alte hängende Einträge blockieren neue Starts nicht mehr.
