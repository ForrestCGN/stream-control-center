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

Naechste sinnvolle Reihenfolge:

1. STEP212 live testen:
   - Auth-Status pruefen.
   - Rollen pruefen.
   - Session lesen, falls eingeloggt.
   - Kein Fehler beim Login/Logout.
2. Danach grosse Module nur mit separater Analyse planen:
   - `alert_system.js`
   - `tagebuch.js`
   - `todo.js`
   - `challenge.js`
3. Erst nach vollstaendiger Portierung und Tests echten MySQL-/MariaDB-Adapter und Treiber einbauen.

Wichtig:

- Keine produktive DB-Umschaltung vor vollstaendiger Modul-Portierung.
- Keine neue `app.sqlite` erzeugen.
- Keine bestehende SQLite-Funktionalitaet fuer theoretische MariaDB-Vorbereitung brechen.
- Neue DB-Logik ueber `backend/core/database.js` oder vorhandene Helper bauen.

## STEP212 Tests

Nach Entpacken und Deploy pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/roles" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/auth/session" | ConvertTo-Json -Depth 80
```

Wenn ein Dashboard-Login aktiv ist, zusaetzlich im Browser pruefen:

```text
http://127.0.0.1:8080/dashboard/
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

Nach 10 bis 12 Minuten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=10" | ConvertTo-Json -Depth 120
```

Nach Streamende:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
```
