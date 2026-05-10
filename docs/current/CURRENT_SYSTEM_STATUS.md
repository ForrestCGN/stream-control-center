# CURRENT SYSTEM STATUS

Stand: 2026-05-10

## Loyalty / Kekskrümel

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
