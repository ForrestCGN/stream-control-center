# STEP203.1 - Loyalty Watch Shadow Hook

Stand: 2026-05-09

## Ziel

Dieser STEP erweitert den Loyalty-Core aus STEP203 um einen echten Watch-/Presence-Heartbeat im Shadow Mode.

Ziel ist nicht, StreamElements zu ersetzen, sondern das neue System sicher parallel mitlaufen zu lassen.

## Ergebnis

Neu:

```text
GET  /api/loyalty/watch/heartbeat
POST /api/loyalty/watch/heartbeat
GET  /api/loyalty/watch/states
```

Version:

```text
loyalty 0.1.1
```

Schema:

```text
loyalty schema version 2
```

## Neue DB-Struktur

Neu angelegt per sanfter Migration / Safety-Net:

```text
loyalty_watch_state
```

Zweck:

- letzter Heartbeat pro User
- letzter Reward-Zeitpunkt
- nächster erlaubter Reward-Zeitpunkt
- Intervall-Schutz gegen doppelte Punkte
- Subscriber-Status pro Heartbeat
- Quelle des Heartbeats
- Heartbeat-/Reward-Zähler

Wichtige Felder:

```text
user_login
user_display_name
mode
subscriber
source
last_heartbeat_at
last_reward_at
next_reward_at
heartbeat_count
reward_count
metadata_json
```

## Intervall-Schutz

Die neue Heartbeat-Route vergibt Watch-Punkte nur, wenn der User im aktuellen Intervall noch keine Punkte erhalten hat.

Aktueller Standard:

```text
watch.amount = 2
watch.intervalMinutes = 10
watch.subscriberMultiplier = 3
```

Erwartung:

```text
Viewer: +2 pro fälligem Intervall
Subscriber: +6 pro fälligem Intervall
```

Wenn ein zweiter Heartbeat innerhalb des Intervalls kommt:

```text
awarded = false
skipped = true
reason = watch_interval_not_due
```

## Shadow Mode bleibt aktiv

Der Modus bleibt:

```text
loyalty.mode = shadow
```

StreamElements bleibt aktiv. Es wird nichts abgeschaltet und kein Import durchgeführt.

## Ignored Users

Ignored Users werden weiterhin berücksichtigt.

Für ignorierte User:

```text
ignored = true
transaction = null
```

Außerdem wird kein User-Konto und keine Punkte-Transaktion erzeugt.

## API-Verhalten

### GET /api/loyalty/watch/heartbeat

Beispiel:

```text
/api/loyalty/watch/heartbeat?login=testviewer&displayName=TestViewer&source=manual
```

### POST /api/loyalty/watch/heartbeat

Beispiel Body:

```json
{
  "login": "testsub",
  "displayName": "TestSub",
  "subscriber": true,
  "source": "twitch_presence"
}
```

### GET /api/loyalty/watch/states

Zeigt aktuelle Watch-State-Zeilen.

## Bekannter kleiner Cleanup

`recordTransaction` gibt bei ignored Usern jetzt `ok: true` zurück, weil Ignorieren kein technischer Fehler ist, sondern erwartetes Verhalten.

## Betroffene Datei

```text
backend/modules/loyalty.js
```

## Keine Änderung an

```text
config/loyalty.json
Dashboard
Overlays
Streamer.bot
StreamElements
```

## Tests

Syntax:

```text
node -c backend/modules/loyalty.js
```

Live nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/heartbeat?login=watchviewer&displayName=WatchViewer" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/heartbeat?login=watchviewer&displayName=WatchViewer" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/heartbeat?login=watchsub&displayName=WatchSub&subscriber=1" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/watch/states" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
erster watchviewer Heartbeat: awarded true, +2
zweiter watchviewer Heartbeat direkt danach: awarded false, watch_interval_not_due
watchsub Heartbeat: awarded true, +6
```

## Nächster sinnvoller Schritt

STEP203.2:

```text
Loyalty Twitch Presence / Streamer.bot Hook
```

Ziel:

- echten Chat-/Presence-Trigger anbinden
- nur aktive Zuschauer regelmäßig melden
- keine öffentlichen Punkte-Commands aktivieren
- Shadow Mode weiter beibehalten
