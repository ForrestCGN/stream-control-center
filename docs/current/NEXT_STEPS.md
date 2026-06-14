# NEXT_STEPS – stream-control-center

Stand: 2026-06-14

## Aktueller Stand nach CAN44.42 Real-Test

```text
SO / AutoSO / Live-Status sind intern durchgetestet und live-real bestätigt.
CAN44.42 ist der aktuelle stabile Shoutout/AutoSO/Live-Arbeitsstand.
```

## Real-Test 2026-06-14 – Ergebnis

### Streamstart

```text
status = live
live = True
streamId = 317679322342
streamSession.twitchConfirmed = true
streamDayId = stream_forrestcgn_20260614t140137581z_pending
lastEventKey = twitch.stream.online
onlineEmitted = 1
offlineEmitted = 0
errors = 0
```

### AutoShoutout Online-Consumer

```text
clip_shoutout = 0.2.49
streamBusSubscriber.installed = True
onlineReceived = 1
lastEventKey = twitch.stream.online
lastResultReason = accepted
streamDayId = stream_forrestcgn_20260614t140137581z_pending
```

### Streamende

```text
status = offline
live = False
lastEventKey = twitch.stream.offline
onlineEmitted = 1
offlineEmitted = 1
sessionGrace = 1
sessionEnded = 1
errors = 0
bandwidthTestDetected = 0
```

### AutoShoutout Offline-Consumer

```text
delivered = 2
onlineReceived = 1
offlineReceived = 1
lastEventKey = twitch.stream.offline
lastResultReason = accepted
errors = 0
```

## Bewertung

```text
✅ Echter Streamstart wurde erkannt.
✅ Twitch bestätigte den Stream als live.
✅ streamDayId blieb während des Streams stabil.
✅ twitch.stream.online wurde genau einmal emitted.
✅ AutoShoutout empfing und akzeptierte online.
✅ Echtes Streamende wurde erkannt.
✅ twitch.stream.offline wurde genau einmal emitted.
✅ AutoShoutout empfing und akzeptierte offline.
✅ Keine Fehler.
✅ Kein Bandbreitentest-Fehlverhalten.
✅ Keine doppelten Events.
```

## Nächster sinnvoller Arbeitsblock

```text
Tagebuch an zentralen StreamState anbinden.
```

Warum Tagebuch zuerst:

```text
- fachlich stark vom echten Streamtag abhängig
- geringeres Risiko als Alerts/VIP30/Loyalty
- guter erster Consumer nach AutoShoutout
- Stream über 00:00 soll sauber derselbe Streamtag bleiben
- Systemeinträge sollen nicht durch Pending/Bandbreitentest ausgelöst werden
```

## Vor Umsetzung Tagebuch zwingend prüfen

```text
1. Echte Dateien aus GitHub/dev prüfen.
2. Bestehende Tagebuch-Module/Helper/Routes prüfen.
3. Bestehende DB-Tabellen/Migrationen nur lesend prüfen.
4. Bestehenden Communication Bus / Helper verwenden.
5. Keine neue Parallelstruktur bauen.
6. Keine DB ersetzen oder neu bauen.
7. Ziel/Dateien/Änderungen/Nichtänderungen/Tests nennen.
8. Auf Forrests go warten.
```

## Vermutlich relevante Bereiche für Tagebuch-Prüfung

```text
backend/modules/tagebuch.js
backend/modules/discord/tagebuch.js
backend/modules/helpers/helper_communication.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_messages.js
backend/core/database.js
htdocs/dashboard/modules/tagebuch.js
htdocs/dashboard/modules/tagebuch.css
docs/modules/tagebuch.md
```

Hinweis: Die echten Pfade müssen vor Umsetzung im Repo geprüft werden. Nicht raten.

## Danach sinnvolle Reihenfolge

```text
1. Tagebuch an zentralen StreamState anbinden
2. Clips an zentralen StreamState anbinden
3. ShoutoutV2-/AutoShoutout-Diagnose erweitern
4. Alerts an zentralen StreamState anbinden
5. VIP30 / Channelpoints Live-only Regeln
6. Loyalty / Giveaways / Glücksrad
7. Event-System
```

## Nicht jetzt nötig

```text
Großer Refactor
Neue DB-Migrationen ohne konkrete Notwendigkeit
Umbau Communication Bus
Entfernen bestehender Fallbacks
Umbau ShoutoutV2
Produktive Alert-/VIP30-/Loyalty-Änderungen vor Tagebuch-Testconsumer
```
