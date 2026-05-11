# STEP203.2 - Twitch Presence Activity Collector

Stand: 2026-05-09

## Ziel

Dieser STEP erweitert `twitch_presence.js` um einen Activity Collector für Twitch-Chat-Presence.

Ziel ist die saubere Grundlage für Loyalty Watch-Punkte im Shadow Mode:

```text
JOIN/PART/PRIVMSG/USERNOTICE erfassen
aktive/anwesende User berechnen
Lurker grundsätzlich berücksichtigen
noch keine automatische Loyalty-Punktevergabe
```

## Geänderte Datei

```text
backend/modules/twitch_presence.js
```

## Neue DB-Tabelle

```text
twitch_presence_activity
```

Die Tabelle wird sanft per `CREATE TABLE IF NOT EXISTS` angelegt.

Gespeichert werden u. a.:

```text
user_login
user_display_name
user_id
status
subscriber
subscriber_tier
badges_json
last_join_at
last_part_at
last_message_at
last_usernotice_at
last_chatters_seen_at
last_seen_at
present_until
source
join_count
part_count
message_count
usernotice_count
metadata_json
```

## Neue Routen

```text
GET  /api/twitch/presence/activity
GET  /api/twitch/presence/activity/active
POST /api/twitch/presence/activity/clear
GET  /api/twitch/presence/activity/test
```

## Statuslogik

Der Collector unterscheidet:

```text
present
User ist vermutlich im Chat anwesend.

active
User hat kürzlich geschrieben.

left
User hat PART gesendet.

stale
User wurde zu lange nicht bestätigt.

unknown
nicht eindeutig.
```

## Zeitlogik

Defaults:

```text
JOIN-only gültig: 30 Minuten
PRIVMSG / USERNOTICE aktiv: 60 Minuten
Get-Chatters-Bestätigung vorbereitet: 30 Minuten
```

Diese Werte sind über ENV vorbereitet:

```text
TWITCH_PRESENCE_PRESENT_MINUTES
TWITCH_PRESENCE_ACTIVE_MINUTES
TWITCH_PRESENCE_JOIN_ONLY_MINUTES
TWITCH_PRESENCE_ACTIVITY_MAX_ROWS
```

## Subscriber-Tier

Der Collector speichert:

```text
subscriber
subscriberTier
```

Mögliche Werte:

```text
none
prime
tier1
tier2
tier3
unknown
```

Aktuell wird aus IRC-Badges sicher `subscriber=true` erkannt. Echte Tier-Erkennung bleibt Beobachtungspunkt, weil Twitch-Tags je nach Event/Badge unterschiedlich ausfallen können.

## Wichtig

Dieser STEP vergibt noch keine Loyalty-Punkte automatisch.

Der nächste STEP verbindet aktive User aus Twitch Presence mit dem Loyalty Heartbeat.

## Tests

Syntax:

```powershell
node -c backend\modules\twitch_presence.js
```

Live nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/integration-check" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity/test?login=presenceviewer&displayName=PresenceViewer&event=join" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity/test?login=presenceviewer&displayName=PresenceViewer&event=privmsg" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/activity/active?minutes=30" | ConvertTo-Json -Depth 30
```

## Nächster Schritt

```text
STEP203.3 - Loyalty Twitch Presence Heartbeat Runner
```

Dann werden aktive/presente User aus `twitch_presence_activity` an Loyalty Heartbeat übergeben.
