# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Aktueller Hauptfokus - Loyalty / Twitch Presence

Aktueller Stand:

- Loyalty-Core läuft im Shadow Mode.
- Watch-Heartbeat mit Intervall-Schutz ist vorhanden.
- Twitch Presence wurde um Activity Collector erweitert.
- Automatische Loyalty-Punktevergabe aus Twitch Presence ist noch nicht aktiv.

Aktuelle relevante Dateien:

```text
backend/modules/loyalty.js
backend/modules/twitch_presence.js
config/loyalty.json
```

Neue Twitch-Presence-Routen:

```text
GET  /api/twitch/presence/activity
GET  /api/twitch/presence/activity/active
POST /api/twitch/presence/activity/clear
GET  /api/twitch/presence/activity/test
```

Neue DB-Struktur:

```text
twitch_presence_activity
```

Berechnung aktiver User:

```text
JOIN => present für 30 Minuten
PRIVMSG => active für 60 Minuten
USERNOTICE => active für 60 Minuten
PART => left
Ablauf von present_until => stale
```

Subscriber-Tier wird vorbereitet als:

```text
none | prime | tier1 | tier2 | tier3 | unknown
```

## Bewusst offen

- echte Twitch-Tags im Livebetrieb prüfen
- Tier-Erkennung anhand realer Badges/Tags verbessern
- Get Chatters API später ergänzen
- STEP203.3: Activity Collector mit Loyalty Heartbeat verbinden
