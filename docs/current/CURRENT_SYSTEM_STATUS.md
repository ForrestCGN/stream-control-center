# CURRENT SYSTEM STATUS

Stand: 2026-05-10

## DB-Portabilitaet / SQLite / MySQL / MariaDB

Seit STEP207:

- Aktive Produktivdatenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- SQLite bleibt Standard und Fallback.
- `backend/core/database.js` ist die zentrale Zielschicht fuer neue DB-Zugriffe.
- MySQL und MariaDB sollen spaeter beide unterstuetzt werden.
- MySQL und MariaDB werden als gemeinsame MySQL-Family-Zielarchitektur geplant.
- Direkte `sqlite_core`-Kopplungen in bestehenden Modulen wurden dokumentiert.
- Kein Code, keine DB und kein Treiber wurden in STEP207 geaendert.

Aktuelle Regel:

```text
Neue DB-Zugriffe nicht direkt an backend/modules/sqlite_core.js koppeln, wenn backend/core/database.js oder ein vorhandener Helper genutzt werden kann.
```

## Loyalty / Kekskruemel

Aktueller Stand:

- Shadow Mode aktiv.
- StreamElements bleibt aktiv.
- Watch/Lurk-Punkte laufen ueber Twitch Presence + Auto Runner.
- Event-Boni koennen echte Twitch/EventSub-Events im Shadow Mode verarbeiten.
- Follow, Subscribe, Resub, Cheer/Bits, Raid und GiftSub werden unterstuetzt.
- GiftSub-Receiver-Buchungen sind aktiv, wenn ein `recipientLogin` vorhanden und der Receiver-Bonus aktiviert ist.
- Duplicate-Schutz bleibt ueber `eventUid` aktiv.

## Runner / Stream-State

Seit STEP204:

- `/api/loyalty/stream-state/start` startet den AutoRunner automatisch.
- `/api/loyalty/stream-state/stop` stoppt den AutoRunner automatisch.
- Der Start ist idempotent und erzeugt keine doppelten Timer.
- Quellen und Gruende werden in `loyalty_runner_events` geloggt.

Seit STEP205:

- Doppelte Online-Signale ueberschreiben den bestehenden Stream-State nicht mehr.
- Wenn Streamer.bot zuerst live setzt und Twitch/EventSub danach ebenfalls online meldet, bleibt `manual.source = streamerbot` erhalten.
- Das Twitch/EventSub-Signal wird als `stream_state_start_signal` geloggt.

## GiftSub-Verhalten

Bei GiftSub mit `recipientLogin`:

```text
Gifter bekommt giftSubGiver-Punkte.
Receiver bekommt giftSubReceiver-Punkte.
```

Voraussetzung:

```text
bonuses.giftSubGiver.enabled = true
bonuses.giftSubReceiver.enabled = true
features.eventBonusesEnabled = true
```

## Aktuelle Livetest-Prioritaet

Naechster fachlicher Schritt ist der echte Stream-Livetest nach STEP206:

- Vor Streamstart Status/Ignore-Liste pruefen.
- Nach Streamstart AutoRunner pruefen.
- Nach 10 bis 12 Minuten Watch-Punkte pruefen.
- Bot-/Systemuser muessen `ignored_user` liefern.
- Event-Boni weiterhin beobachten.
- Nach Streamende Runner/Stream-State offline pruefen.
