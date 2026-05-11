# NEXT STEPS - stream-control-center

Stand: 2026-05-11

## Twitch Subscription Tier-Text

Nach STEP222 testen:

```powershell
$body = @{
  kind = "sub"
  user = "TestSub"
  display = "TestSub"
  tier = "1000"
  dryRun = $true
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 40
```

Erwartung:

```text
eventsubType = channel.subscribe
type = sub
message = leer
tier = 1000
```

Danach als naechsten fachlichen Fix bauen:

- Cheer-/Bits-TTS-Bereinigung:
  - `Cheer100` -> kein TTS
  - `Cheer100 test` -> `test`
  - `Cheer10 Cheer10 Cheer100 test` -> `test`
- Danach Dashboard-UI fuer den Twitch Event Simulator.

## Twitch Alert Bridge / Sub-Message-Buffer

Nach STEP220 im naechsten echten Stream beobachten:

- Kommt bei Usern wie Penny `channel.subscribe` und kurz danach `channel.subscription.message`, darf nur ein sichtbarer Alert laufen.
- In `/api/twitch/alerts/status` soll `recent` in solchen Faellen `buffered`, `buffer_replaced` oder `buffer_flushed` zeigen.
- Falls Twitch in der Praxis laenger als 30 Sekunden zwischen Subscribe und Subscription-Message braucht, `subMessageBuffer.delayMs` spaeter erhoehen.

Pruefung nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 40
```

Erwartung:

```text
subMessageBuffer.enabled = true
subMessageBuffer.delayMs = 30000
lastError leer
```

## Twitch Event Simulator / Alert-Mapping

Nach STEP221:

1. Backend neu starten.
2. Debug-Routen testen:
   - `GET /api/twitch/alerts/debug/presets`
   - `POST /api/twitch/alerts/debug/eventsub`
3. Danach STEP222 bauen:
   - Dashboard-UI fuer Twitch Event Simulator.
4. Danach Mapping-/Normalisierungs-Audit:
   - Welche Twitch-EventSub-Typen kommen rein?
   - Welche Alert-Typen erzeugen wir?
   - Welche Felder duerfen TTS ausloesen?
   - `Cheer10`, `Cheer100` usw. aus TTS-Text entfernen.
   - Technische Werte wie `Tier 1000` nicht mehr als User-Message/TTS behandeln.

## Twitch Event Simulator / Dashboard

Nach STEP221 bis STEP223 ist der Backend-Simulator nutzbar und die ersten Normalisierungsfehler sind bereinigt.

Naechster sinnvoller Schritt:

1. Dashboard-UI fuer `/api/twitch/alerts/debug/presets` und `/api/twitch/alerts/debug/eventsub` bauen.
2. Twitch-Event-Mapping-Tabelle dokumentieren und im Simulator sichtbar machen.
3. Weitere Eventtypen einzeln testen: Follow, Bits, Subscribe, Resub, GiftSub, GiftBomb, Raid, Channel Points.

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


## Twitch Event-/Alert-Audit

Nach STEP224:

- Twitch Event Simulator im Dashboard fuer Presets verwenden.
- Mapping fuer Follow, Bits, Sub, Resub, GiftSub, GiftBomb, Raid und Channel Points dokumentieren.
- Danach entscheiden, ob weitere Eventtypen eigene Alert-Typen oder Regeln brauchen.
