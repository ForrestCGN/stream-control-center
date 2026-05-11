# NEXT STEPS - stream-control-center

Stand: 2026-05-11

## Nach STEP229 - Message-Rotator

Nach Entpacken, `stepdone.cmd` und Backend-Neustart pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/settings" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/texts" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/integration-check" | ConvertTo-Json -Depth 80
```

Naechster sinnvoller STEP:

```text
STEP230 - Message-Rotator Dashboard-Modul
```

Geplante Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.css
```

Ziel STEP230:

- Rotator im System-Bereich aktivieren.
- Status, Start/Stop, Settings, Items und Textvarianten im Dashboard verwaltbar machen.
- Dashboard greift nur ueber Backend-APIs zu, nicht direkt auf DB/JSON.

Stand: 2026-05-11

## Nach STEP227

- `GET /api/twitch/eventsub/subscriptions` ausführen und aktive Twitch EventSub-Typen prüfen.
- Danach die Twitch-Alert-Mapping-Prüfung Event für Event fortsetzen:
  1. `channel.follow`
  2. `channel.subscribe`
  3. `channel.subscription.message`
  4. `channel.subscription.gift`
  5. `channel.subscribe` mit `is_gift:true`
  6. `channel.raid`
  7. `channel.channel_points_custom_reward_redemption.add`
  8. `channel.bits.use`, falls aktiv
  9. `channel.hype_train.*`, falls aktiv
- Entscheiden, ob ein technischer `messageId`-Dedupe für EventSub zusätzlich nötig ist.



## Naechster Check - Twitch Cheermote TTS

Nach STEP226 pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/cheermotes/status?includePrefixes=1" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/cheermotes/reload" -Method Post | ConvertTo-Json -Depth 80
```

Simulator-Test:

```powershell
$body = @{
  kind = "bits"
  user = "TestCheerer"
  display = "TestCheerer"
  bits = 20
  message = "ShowLove10 ShowLove10 Guten morgen!"
} | ConvertTo-Json

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/debug/eventsub" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=1" | ConvertTo-Json -Depth 100
```

Erwartung: TTS spricht nur `Guten morgen!`; Original-Alert-Message bleibt unveraendert.

## Twitch/EventSub Audit - naechster Stream

Nach dem naechsten echten Twitch-Event pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/audit/recent?limit=50" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 60
```

Ziel: Roh-EventSub-Eingang gegen Alert-History abgleichen und pruefen, ob Twitch unerwartete oder verspaetete Events liefert.

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


# NEXT_STEPS Ergänzung – nach STEP228

## Twitch / Alert-System – spätere geplante Blöcke

### 1. GiftBomb 101+ Special-/Jackpot-Alert

Ziel:

```text
gift_bomb min_value 101 max_value null
```

Benötigt:

```text
- eigene Regel
- eigener Sound
- eigenes Display-Profil
- eigener Chattextblock
- Special-/Jackpot-Overlay
```

### 2. Dynamische SubBomb-Zahl im Overlay

Ziel:

```text
SubBomb-Zahl dynamisch aus amount / quantity / total anzeigen.
Keine Einzelgrafiken pro Zahl.
```

Beispiele:

```text
10 -> große 10
12 -> große 12
100 -> große 100 / Special-Design
```

### 3. GiftBomb-Empfänger-Highlights

Idee:

```text
Bei großer Subbombe Empfänger sammeln.
Nur Chat-aktive Empfänger optional hervorheben.
Maximal begrenzte Anzahl kleiner Empfänger-Hinweise.
Niemals alle Empfänger einzeln als Alerts abspielen.
```

### 4. Prime-Sub / Prime-Resub

Ziel:

```text
Prime als eigener Alert/Eventtyp:
prime_sub
prime_resub
```

Benötigt:

```text
- channel.chat.notification abonnieren
- is_prime auswerten
- mit channel.subscribe / channel.subscription.message zusammenführen
- eigene Regeln/Sounds/Bilder/Chattexte
```

### 5. HypeTrain-System

Ziel:

```text
Eigenes System für:
hype_train_begin
hype_train_level_up
hype_train_level_jump
hype_train_end
```

Wichtig:

```text
Nur newLevel > lastLevel löst Alert aus.
Gleicher Level mehrfach = nur Statusupdate.
Levelsprung 1 -> 6 = ein passender Level-6-/Sprung-Alert.
```

### 6. Shoutout-/SO-Statistik

Ziel:

```text
channel.shoutout.create/receive für Audit und Statistik nutzen.
Nicht als normalen Alert.
Nicht als automatischen Start für Clip-Shoutout.
```

Auswertungen:

```text
- wer hat /so ausgelöst
- wohin wurde shoutoutet
- wann
- wie oft pro Zielkanal
- wie oft pro Moderator
- Cooldowns
```

### 7. TTS-Wortfilter / Moderation

Ziel:

```text
Badword-/Blacklist-/Replacement-System für Alert-TTS.
Dashboard-konfigurierbar.
```