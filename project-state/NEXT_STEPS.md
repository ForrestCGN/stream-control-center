# NEXT_STEPS – stream-control-center

Stand: 2026-06-15
Fokus nächster Chat: Stream-Go-Live + Punkteimport

## 1. Go-Live Check vor dem Stream

Prüfen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\backend\modules\loyalty.js
```

Status prüfen:

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy | Select-Object ok,module,version,lastError
$loy.twitchEventBonusBinding | Select-Object installed,subscriptionCount,received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError
```

Settings prüfen:

```powershell
$cfg = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings"
$cfg.config.watch
$cfg.config.autoRunner
$cfg.config.bonuses.raid
$cfg.config.bonuses.giftSubReceiver
```

Twitch EventSub / Events prüfen:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

Alert Shadow prüfen:

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch-events/status"
$a | Select-Object installed,effectiveMode,received,mapped,wouldEnqueue,enqueued,skipped,errors,lastEventKey,lastLogin,lastTypeKey,lastError
```

Erwartung:

```text
Loyalty ok.
Event Binding 7/7.
Alert effectiveMode shadow.
Keine Alert-Bus-Produktivumschaltung.
```

## 2. Letzte Testwerte zurückstellen

Kontrollieren, ob Testwerte zurückgestellt wurden:

```text
Raid maxAmount sollte vermutlich 250 sein, wenn 249 nur Test war.
watch.amount wurde wieder auf 2 gestellt.
subscriberMultiplier / Tier-Werte prüfen, weil sie im Test geändert wurden.
```

## 3. Punkteimport vorbereiten

Erst Quelle prüfen:

```text
Dateiformat?
Spalten/Felder?
User-Mapping?
Addieren oder ersetzen?
Import als Transaktion?
```

Empfehlung:

```text
Dry-Run zuerst.
Danach Backup.
Dann Import additiv über Transaktionen.
Keine direkte DB-Überschreibung.
```

## 4. Punkteimport implementieren

Erst nach Sichtung der Importquelle:

```text
Import-Route oder CLI-Import prüfen/planen.
Keine bestehenden User/Punkte blind überschreiben.
Transaktionsgrund eindeutig setzen.
Audit/Log erfassen.
Import-Ergebnis als CSV/JSON-Zusammenfassung ausgeben.
```

## 5. Nach dem Stream beobachten

```text
Loyalty → Logs
Support-Events
Auto-Punkte
GiftSub/GiftBomb Receiver Tracking
Raid-Berechnung
Fehler/Skips/Duplikate
```
