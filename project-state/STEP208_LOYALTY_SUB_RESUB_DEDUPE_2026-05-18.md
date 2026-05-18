# STEP208 – Loyalty Subscribe/Resub Dedupe

Stand: 2026-05-18

## Ziel

Twitch kann bei einem echten Resub kurz nacheinander zwei Events liefern:

- `subscribe`
- `resub` / `channel.subscription.message`

In der Mehrtage-Auswertung trat das bei `drudchen_cgn` auf. Dadurch wurden bisher `+50 subscribe` und direkt danach `+100 resub` gebucht. Fachlich soll in diesem Fall nur der Resub zählen.

## Umsetzung

Betroffene Datei:

- `backend/modules/loyalty.js`

Änderungen:

- Version von `0.1.10` auf `0.1.11` erhöht.
- Neue Config/Settings-Gruppe ergänzt:
  - `eventDedupe.subscribeResubCollision.enabled`
  - `eventDedupe.subscribeResubCollision.windowSeconds`
- Standard:
  - enabled: `true`
  - windowSeconds: `60`
- Neue interne Hilfsfunktionen:
  - `getSubscribeResubCollisionDedupeConfig()`
  - `findRecentSubscribeForResubCollision()`
  - `markSubscribeReplacedByResub()`
  - `compensateRecentSubscribeForResubCollision()`

## Verhalten

Wenn ein `resub` verarbeitet wird, prüft Loyalty:

- gleicher User/Login
- gleicher Provider
- gleiches Tier
- vorheriges `subscribe`-Event im konfigurierten Zeitfenster
- vorheriger Subscribe ist verarbeitet, nicht duplicate und noch nicht ersetzt

Wenn ein passender Subscribe gefunden wird:

1. Der vorherige Subscribe wird als `replaced_by_resub` markiert.
2. Die Punkte des Subscribe-Events werden auf `0` gesetzt.
3. Eine Ausgleichstransaktion wird gebucht:
   - type: `event_dedupe_adjustment`
   - reason: `event_subscribe_replaced_by_resub`
   - amount: negativer Wert der ursprünglichen Subscribe-Punkte
4. Der Resub wird normal gebucht.

Beispiel:

- vorher: `+50 subscribe` + `+100 resub` = `+150`
- nach Dedupe: `+50 subscribe` + `-50 adjustment` + `+100 resub` = `+100`

## Bewusst nicht geändert

- Keine GiftSub-/GiftBomb-Logik geändert.
- Keine Watch-Punkte-Logik geändert.
- Keine Runner-/Stream-State-Logik geändert.
- Keine DB-Schemaänderung.
- Keine bestehenden Transaktionen gelöscht.
- Kein historischer Cleanup für bereits vorhandene Altfälle eingebaut.

## Tests

Lokaler Syntaxcheck:

```powershell
node --check backend/modules/loyalty.js
```

Erwartung:

- keine Ausgabe / Exit Code 0

Empfohlener Funktionstest nach Deploy:

1. Test-Subscribe für denselben User auslösen.
2. Innerhalb von 60 Sekunden Test-Resub für denselben User auslösen.
3. Danach prüfen:
   - vorheriger Subscribe hat `reason = replaced_by_resub`
   - es gibt eine `event_dedupe_adjustment`-Transaktion mit negativem Subscribe-Betrag
   - Resub bleibt normal verarbeitet
   - Netto-Punkte entsprechen nur dem Resub

## Rollback

Rollback über Git/Deploy auf den vorherigen Stand. Da keine DB-Schemaänderung erfolgt, ist kein Datenbank-Rollback nötig.
