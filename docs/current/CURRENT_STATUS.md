# CURRENT_STATUS – stream-control-center

Stand: 2026-06-15

## Aktueller Arbeitsstand

```text
LC-CORE-POINTS-2C – Twitch Presence / aktive User bestätigt
```

## Kurzfazit

Nach `LC-CORE-CLEANUP-1` und `LC-CORE-POINTS-1` ist der Loyalty-Core auf die StreamElements-nahe Punktevergabe vorbereitet und getestet. Loyalty nutzt weiterhin `/api/twitch/events/stream-state` als zentrale Live-Wahrheit. Watch-Punkte, Sub-Tier-Fallbacks, Resub-Bonus, EventBus-AutoRunner-Start und Twitch-Presence-Verarbeitung wurden fachlich bestätigt.

## Bestätigte Punkte-Zielwerte

```text
Viewer: 2 Kekskrümel alle 10 Minuten
Tier 1 Subscriber: 6 Kekskrümel alle 10 Minuten
Tier 2 Subscriber: 8 Kekskrümel alle 10 Minuten
Tier 3 Subscriber: 10 Kekskrümel alle 10 Minuten

Follow: 10
Sub Tier 1/2/3: 50 / 100 / 150
Resub Tier 1/2/3: 50 / 100 / 150
Cheer: 10 pro 100 Bits
Tip: 10 pro 1 EUR
Raid: 50
```

## Bestätigt in LC-CORE-POINTS-1

```text
backend/modules/loyalty.js Version 0.1.15 läuft.
watch.subscriberTierAmounts ist aktiv.
bonuses.resub.enabled ist aktiv.
Erster Watch-Heartbeat vergibt keine Sofortpunkte.
Fällige Watch-Intervalle vergeben korrekte Werte:
Viewer 2, Tier 1 6, Tier 2 8, Tier 3 10.
```

## Bestätigt in LC-CORE-POINTS-2A / 2B

```text
Normaler Online-Override ohne Confirm setzt Twitch Events auf pending.
Pending startet den Loyalty-AutoRunner bewusst nicht automatisch.
Confirmed Override (`live=true`, `confirmed=true`, `status=confirmed`) publiziert `twitch.stream.online`.
Loyalty empfängt das Bus-Event und startet den AutoRunner.
Clear-Override publiziert `twitch.stream.offline` und stoppt den AutoRunner.
```

## Bestätigt in LC-CORE-POINTS-2C

```text
Twitch Presence kann gestartet werden.
Bot `heimaufsichtcgn` verbindet sich mit Twitch IRC und joined `#forrestcgn`.
Presence Activity speichert JOIN-/Activity-Daten in `twitch_presence_activity`.
`/api/twitch/presence/activity/active` liefert aktive/presente User.
`/api/loyalty/presence/run-once` verarbeitet Presence-User.
Ignored/Systemuser werden übersprungen.
Echte aktive User erhalten Watch-Punkte.
```

## Offene Beobachtung

```text
JOIN-basierte Presence erkennt Subscriber ja/nein, aber das konkrete Sub-Tier kommt häufig als `none`/`unknown`.
In diesem Fall greift korrekt der bestehende Subscriber-Fallback über `subscriberMultiplier` und vergibt 6 Punkte.
```

## Offener Entscheid

```text
Prüfen, ob `forrestcgn` dauerhaft wieder ignoriert werden soll.
Im bestätigten Presence-Test bekam `forrestcgn` Watch-Punkte, weil der User aktuell nicht aktiv ignoriert wurde.
```

## Nicht geändert

```text
Keine Commands aktiviert.
Keine Live-/Shadow-Umstellung.
Keine produktive SQLite ersetzt oder gelöscht.
Keine Giveaway-/Games-Änderung.
Keine Dashboard-Neustruktur.
```
