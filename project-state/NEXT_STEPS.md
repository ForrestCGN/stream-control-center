# NEXT STEPS - stream-control-center

Stand: 2026-05-10

## DB-Portabilitaet

SQLite bleibt aktiv, bis ein echter MariaDB-/MySQL-Server vorhanden ist und alle relevanten Module sauber portiert und getestet wurden.

Naechste sinnvolle Reihenfolge:

1. Naechstes kleines direktes `sqlite_core`-Modul schrittweise auf `backend/core/database.js` umstellen:
   - `twitch.js`

Bereits portiert:

- `kofi.js`
- `tipeee.js`
2. Danach mittlere Module pruefen:
   - `sound_system.js`
   - `dashboard_auth.js`
3. Danach grosse Module planen:
   - `alert_system.js`
   - `tagebuch.js`
   - `todo.js`
   - `challenge.js`
4. Erst danach echten MySQL-/MariaDB-Adapter und Treiber einbauen.

Wichtig:

- Keine produktive DB-Umschaltung vor vollstaendiger Modul-Portierung.
- Keine neue `app.sqlite` erzeugen.
- Keine bestehende SQLite-Funktionalitaet fuer theoretische MariaDB-Vorbereitung brechen.
- Neue DB-Logik ueber `backend/core/database.js` oder vorhandene Helper bauen.

## Naechster echter Stream - Loyalty Livetest

Vor Streamstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/ignored-users" | ConvertTo-Json -Depth 40
```

Nach Streamstart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 100
```

Nach 10 bis 12 Minuten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=10" | ConvertTo-Json -Depth 120
```

Nach Streamende:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
```


## STEP209 Tests

Nach Entpacken und Deploy pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/kofi/status" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/tipeee/status" | ConvertTo-Json -Depth 60
```
