# NEXT STEPS - stream-control-center

Stand: 2026-05-10

## DB-Portabilitaet

SQLite bleibt aktiv, bis ein echter MariaDB-/MySQL-Server vorhanden ist und alle relevanten Module sauber portiert, getestet und SQL-Dialektstellen gekapselt wurden.

Erste Portabilitaetsrunde abgeschlossen:

```text
kofi.js
tipeee.js
twitch.js
sound_system.js
dashboard_auth.js
alert_system.js
tagebuch.js
todo.js
challenge.js
```

STEP217 Restscan:

- Produktive direkte `sqlite_core`-Kopplung ist weitgehend entfernt.
- `backend/core/database.js` und `backend/modules/sqlite_core.js` bleiben absichtlich erhalten.
- `backend/check_alert_db.js` ist ein alter Sonderfall und kann spaeter separat bereinigt werden.
- SQLite-nahe SQL-Konstrukte bleiben vorhanden und sind Thema der zweiten Portabilitaetsrunde.

Naechste sinnvolle Reihenfolge:

1. Optionaler Cleanup-STEP fuer `backend/check_alert_db.js`:
   - behalten und dokumentieren,
   - entfernen/archivieren,
   - oder auf `backend/core/database.js` umstellen.
2. Zweite DB-Portabilitaetsrunde planen:
   - `INTEGER PRIMARY KEY AUTOINCREMENT` zentral kapseln,
   - `ON CONFLICT(...)`/Upsert zentral kapseln,
   - `INSERT OR IGNORE` zentral kapseln,
   - `PRAGMA table_info(...)` durch `database.columnExists(...)`/Helper ersetzen.
3. Erst danach MySQL-/MariaDB-Adapter und Treiber planen.
4. MySQL/MariaDB erst produktiv nutzen, wenn ein echter Server vorhanden ist und ein Testplan fuer Migration/Backup/Rollback steht.

Wichtig:

- Keine produktive DB-Umschaltung vor vollstaendiger Modul-Portierung und Dialekt-Kapselung.
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
