# CURRENT CHAT HANDOFF – Loyalty Go-Live / StreamElements Import / Raffle Live-Test

Stand: 2026-06-15 nach Stream
Projekt: `stream-control-center`
Branch: `dev`
Kontext: Loyalty Core live, StreamElements-Punkteimport abgeschlossen, Raffle im Loyalty-Giveaways-Modul produktiv getestet.

## Kurzstatus

```text
Loyalty Core ist live.
StreamElements-Punkte wurden additiv importiert.
Automatische Watch-Punkte wurden im Stream produktiv gebucht.
Twitch-Event-Boni wurden über twitch_events / Communication Bus produktiv gebucht.
Alerts bleiben weiterhin Shadow und wurden nicht produktiv umgeschaltet.
!raffle ist im bestehenden loyalty_giveaways-Modul integriert, bucht Loyalty-Punkte und wurde im Stream getestet.
```

## Wichtige bestätigte Werte

### Loyalty Core

```text
mode = live
enabled = true
currency = Kekskrümel
features.watchEarningEnabled = true
features.eventBonusesEnabled = true
```

### Automatische Watch-Punkte

```text
watch.enabled = true
watch.amount = 2
watch.intervalMinutes = 10
watch.subscriberMultiplier = 3
watch.subscriberTierAmounts:
  1000 = 6
  2000 = 8
  3000 = 10
```

Aktuelles Verhalten im Stream bestätigt:

```text
Normale Viewer: 2 Kekskrümel pro Intervall
Subscriber/Fallback: 6 Kekskrümel pro Intervall
```

Hinweis: Bei vielen Watch-Transaktionen steht `subscriberTier = unknown` oder `none`, aber `watchAmountSource = subscriber_multiplier_fallback`. Die Buchung funktioniert, Tier-2/Tier-3-Erkennung sollte später separat geprüft werden.

### Raid-Bonus

```text
bonuses.raid.enabled = true
bonuses.raid.mode = base_plus_viewers
baseAmount = 25
amountPerViewer = 2
maxAmount = 250
```

### GiftSub-/GiftBomb-Empfänger

```text
bonuses.giftSubReceiver.enabled = true
mode = small_bonus
amount = 25
tierAmounts:
  1000 = 25
  2000 = 50
  3000 = 75
```

Im Event-Bonus-Test wurden GiftSub-Receiver-Boni als `event_gifted_sub_received` mit `amount = 5` gebucht. Das entspricht offenbar der aktuell aktiven Berechnungslogik für diese Events und sollte später mit der Dashboard-Konfig abgeglichen werden.

## StreamElements-Punkteimport

Importart:

```text
additiv
mode = live
type = legacy_points_import
sourceProvider = streamelements
reason = streamelements_points_import
referenceType = legacy_points_import
referenceId = streamelements_top489_2026-06-15
```

Rohdaten:

```text
StreamElements-Rohdaten: 489 User / 1.858.229 Punkte
Manuell ausgeschlossen: 9 User / 17.156 Punkte
Vom System ignoriert: 1 User / 8.516 Punkte (wahrscheinlich forrestcgn)
Erfolgreich importiert: 479 User / 1.832.557 Punkte
Fehler: 0
```

Manuell ausgeschlossene Accounts:

```text
anonymous
streamstickers
kofistreambot
heimaufsichtcgn
crazy_gamming_network
moobot
blerp
eklipse_chat_12
valorant
```

Geprüfte Beispiel-Balances:

```text
urlug = 1.003.599 nach Import
tigerpranke01 = 119.075 nach Import
```

## Twitch-Events / Loyalty Event-Boni

Nach Stream geprüft:

```text
twitchEventBonusBinding.installed = true
subscriptionCount = 7
received = 22
processed = 22
skipped = 0
duplicates = 0
errors = 0
lastEventKey = twitch.cheer.received
lastLogin = adoredpenny
lastError = leer
```

Transaktionstyp für Support-Events:

```text
type = event_bonus
sourceProvider = twitch_events
```

Beispiele:

```text
Cheer100 -> reason = event_cheer -> amount = 10
GiftSub Gifter -> reason = event_gift_sub -> amount = 50
GiftSub Receiver -> reason = event_gifted_sub_received -> amount = 5
```

## Alerts Shadow

Nach Stream geprüft:

```text
installed = true
effectiveMode = shadow
received = 22
mapped = 22
wouldEnqueue = 21
enqueued = 0
skipped = 1
errors = 0
lastEventKey = twitch.cheer.received
lastTypeKey = bits
lastError = leer
```

Regel bleibt:

```text
Alerts nicht produktiv auf Bus/Twitch-Events umschalten.
Alte Alert-Route bleibt produktiv.
Neue Alert-Anbindung bleibt Shadow, bis separat freigegeben.
```

## Raffle Stand

`!raffle` wurde nicht als neues Modul gebaut, sondern in das bestehende Modul integriert:

```text
backend/modules/loyalty_giveaways.js
```

Aktiver Stand:

```text
moduleVersion = 0.1.7
moduleBuild = STEP_LC_RAFFLE_1F
routeCount = 42
lastError = leer
```

Zentrale Commands:

```text
!raffle -> permissionLevel = mod
!join   -> permissionLevel = everyone
```

Feste aktuelle Raffle-Werte:

```text
Dauer = 120 Sekunden
Teilnahme = !join
Teilnahme-Kosten = 0
Teilnahme pro User = 1x
Gewinnpool intern = 5000 Kekskrümel
Auszahlung = floor(5000 / Gewinneranzahl)
Restpunkte bleiben unverteilt
Buchung = live
Transaktionstyp = raffle_win
Reason = loyalty_raffle_win
ReferenceType = raffle
ReferenceId = raffleUid
```

Gewinnerregel:

```text
1 Teilnehmer: 1 Gewinner
2–10 Teilnehmer: Hälfte gewinnt, abgerundet
11–20 Teilnehmer: 1 Gewinner pro 4 Teilnehmer
21–50 Teilnehmer: 1 Gewinner pro 5 Teilnehmer
51–200 Teilnehmer: 1 Gewinner pro 8 Teilnehmer
über 200 Teilnehmer: 1 Gewinner pro 20 Teilnehmer
```

Nach Stream geprüfte Raffle:

```text
status = finished
participantCount = 6
winnerCount = 3
prizeAmountPerWinner = 1666
lastError = leer
```

Gebuchte Gewinner:

```text
Drudchen_CGN +1666
Lacklecker +1666
udowb +1666
```

Raffle-Transaktionen gesamt nach Tests:

```text
raffle_win count = 8
```

Bestätigte Auszahlungen:

```text
1 Gewinner -> 5000
2 Gewinner -> je 2500
3 Gewinner -> je 1666
```

## Transaktions-Gruppierung nach Stream

Aus `GET /api/loyalty/transactions?limit=500` gruppiert:

```text
292 watch_interval
177 legacy_points_import
22 event_bonus
8 raffle_win
1 game_gamble_loss
```

Hinweis: Bei `limit=500` werden nicht alle Import-Transaktionen sichtbar, weil nur die letzten 500 Transaktionen betrachtet wurden. Der vollständige Import hatte 479 erfolgreiche Transaktionen.

## Offene Punkte

```text
1. Raffle-Chattexte nach STEP_LC_RAFFLE_1F noch einmal sichtbar im Chat prüfen:
   - Startmeldung ohne Pool
   - Join-Text sauber
   - Gewinnertext mit Gewinnerliste und Betrag
   - kein Pool öffentlich sichtbar

2. Subscriber-Tier-Erkennung prüfen:
   - viele Watch-Buchungen laufen über subscriber_multiplier_fallback
   - Tier 2 / Tier 3 Erkennung separat testen

3. GiftSub-Receiver-Konfig mit tatsächlicher Buchung abgleichen:
   - Dashboard zeigte small_bonus amount/tierAmounts
   - Events buchten Receiver teilweise mit amount = 5

4. Raffle später dashboardfähig machen:
   - Dauer
   - Gewinnpool
   - Gewinnerregel
   - Textvarianten
   - Aktivierung/Rechte

5. Alerts weiter mehrere Streams im Shadow beobachten.
   Erst danach alte direkte Alert-Route abbauen oder produktive Bus-Anbindung planen.
```

## Harte Regeln für den nächsten Chat

```text
Nicht raten.
Erst echte Dateien prüfen.
Keine DB überschreiben.
Keine Alert-Produktivumschaltung.
Keine Funktionalität entfernen.
Keine neuen Parallelmodule für Raffle bauen.
Raffle bleibt im bestehenden loyalty_giveaways-Modul, solange keine saubere Umstrukturierung geplant und freigegeben ist.
StepDone vor Test, wenn Forrest das verlangt.
```

## Nächster sinnvoller Schritt

```text
1. Doku/Projektstand final einspielen.
2. StepDone für den Dokumentationsstand ausführen.
3. Beim nächsten Stream Raffle-Textausgabe prüfen.
4. Danach entweder Raffle-Dashboard-Konfig planen oder Subscriber-Tier-Erkennung untersuchen.
```
