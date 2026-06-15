# CURRENT_STATUS – stream-control-center

Stand: 2026-06-15 nach Loyalty-Go-Live-Stream

## Aktueller bestätigter Stand

Loyalty Core ist produktiv live.

Bestätigt:

```text
loyalty version = 0.1.23
mode = live
eventBonusesEnabled = true
watchEarningEnabled = true
```

StreamElements-Punkte wurden additiv in den Live-Modus importiert:

```text
Erfolgreich importiert: 479 User / 1.832.557 Kekskrümel
Fehler: 0
```

Twitch-Events wurden über `twitch_events` / Communication Bus verarbeitet:

```text
received = 22
processed = 22
skipped = 0
duplicates = 0
errors = 0
```

Alert-Twitch-Events bleiben Shadow:

```text
effectiveMode = shadow
enqueued = 0
errors = 0
```

`loyalty_giveaways` enthält jetzt die einfache Chat-Raffle:

```text
moduleVersion = 0.1.7
moduleBuild = STEP_LC_RAFFLE_1F
!raffle = mod
!join = everyone
```

Raffle bucht live Loyalty-Punkte:

```text
interner Gewinnpool = 5000 Kekskrümel
Auszahlung = floor(5000 / Gewinneranzahl)
type = raffle_win
reason = loyalty_raffle_win
```

Watch-Punkte wurden im Stream gebucht:

```text
watch_interval aktiv
Viewer = 2
Subscriber/Fallback = 6
```

## Bekannte offene Punkte

- Raffle-Chattexte aus STEP_LC_RAFFLE_1F müssen im nächsten Test/Stream sichtbar geprüft werden.
- Subscriber-Tier-Erkennung läuft häufig über Fallback; Tier 2/3 später prüfen.
- GiftSub-Receiver-Konfig/Buchung abgleichen.
- Raffle später über Dashboard konfigurierbar machen.
- Alert-Twitch-Events weiter Shadow beobachten.
