# NEXT STEPS - stream-control-center

Stand: 2026-05-10

## DB-Portabilitaet

SQLite bleibt aktiv, bis ein echter MariaDB-/MySQL-Server vorhanden ist und alle relevanten Module sauber portiert und getestet wurden.

Bereits portiert:

- `kofi.js`
- `tipeee.js`
- `twitch.js`
- `sound_system.js`
- `dashboard_auth.js`
- `alert_system.js`
- `tagebuch.js`
- `todo.js`

Naechste sinnvolle Reihenfolge:

1. STEP214 live testen:
   - Tagebuch Status pruefen.
   - Config/Settings/Routes pruefen.
   - Optional Stats pruefen.
   - Keine Fehler in Backend-Log.
2. Danach verbleibende direkte `sqlite_core`-Module einzeln angehen:
   - `todo.js`
   - `challenge.js`
3. Erst danach echten MySQL-/MariaDB-Adapter und Treiber einbauen.

Wichtig:

- Keine produktive DB-Umschaltung vor vollstaendiger Modul-Portierung.
- Keine neue `app.sqlite` erzeugen.
- Keine bestehende SQLite-Funktionalitaet fuer theoretische MariaDB-Vorbereitung brechen.
- Neue DB-Logik ueber `backend/core/database.js` oder vorhandene Helper bauen.

## STEP214 Tests

Nach Entpacken und Deploy pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/routes" | ConvertTo-Json -Depth 100
```

Optional:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/stats/top" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/stats/today" | ConvertTo-Json -Depth 100
```

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


## STEP215 Tests

Nach Entpacken und Deploy pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/stats" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/stats/today" | ConvertTo-Json -Depth 100
```

Naechster DB-Portabilitaets-Kandidat nach erfolgreichem Test: `challenge.js`.
