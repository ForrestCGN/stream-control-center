# CHANGELOG – stream-control-center

Stand: 2026-06-15

## 2026-06-15 – Handoff für LC-CORE-POINTS-3A vorbereitet

### Ergebnis

```text
Der nächste Arbeitsblock wurde neu ausgerichtet. Statt den EventBonus-Pfad direkt nur über /api/loyalty/events/ingest zu testen, soll zuerst twitch_events als zentrale abonnierbare Event-Schicht erweitert werden.
```

### Entscheidung

```text
twitch_events soll Bonus-relevante Twitch-Events zentral publizieren.
loyalty soll diese Events abonnieren und intern recordEventBonus() nutzen.
Später sollen Alerts, Dashboard und Event-System dieselben Bus-Events abonnieren können.
```

### Geplante EventKeys

```text
twitch.follow
twitch.subscribe
twitch.resub
twitch.gift_sub
twitch.gift_bomb
twitch.cheer
twitch.raid
```

### Separat zu planen

```text
Tip/Donation wird nicht als Twitch-natives Event behandelt, sondern später als neutrales Payment-/Donation-Event vorbereitet.
```

## 2026-06-15 – ForrestCGN wieder ignoriert

```text
Nach bestätigtem Presence-Test wurde entschieden, dass forrestcgn wieder dauerhaft ignoriert werden soll.
Der Nutzer hat den Ignored-User-Eintrag gesetzt.
```

## 2026-06-15 – LC-CORE-POINTS-2C Twitch Presence / aktive User bestätigt

### Ergebnis

```text
Twitch Presence wurde als aktive Quelle für Watch-Punkte bestätigt. Der Bot kann sich mit Twitch IRC verbinden, joined #forrestcgn, schreibt JOIN-/Activity-Daten und liefert aktive User an den Loyalty-Presence-Runner. Der Runner verarbeitet diese User korrekt, ignoriert Systemuser und vergibt Watch-Punkte an echte aktive User.
```

### Beobachtung

```text
JOIN-basierte Presence liefert Subscriber ja/nein, aber nicht zuverlässig das konkrete Tier. Bei subscriber=true und subscriberTier=none greift der Fallback über subscriberMultiplier und vergibt 6 Punkte.
```

## 2026-06-15 – LC-CORE-POINTS-2B EventBus / AutoRunner-Autostart bestätigt

```text
Confirmed Manual Override (`live=true`, `confirmed=true`, `status=confirmed`) erzeugt in twitch_events ein echtes `twitch.stream.online` Bus-Event. Loyalty empfängt das Event und startet den AutoRunner automatisch.
Clear-Override erzeugt `twitch.stream.offline`; Loyalty übernimmt den Offline-State und stoppt den AutoRunner.
```

## 2026-06-15 – LC-CORE-POINTS-2A Diagnose / Logging

```text
Diagnoseablauf mit kompaktem PowerShell-Logging erstellt und genutzt. Normaler Online-Override ohne Confirm ist bewusst pending und kein echter AutoRunner-Starttest.
```

## 2026-06-15 – LC-CORE-POINTS-1 Sub-Tier-Watch-Werte und Resub-Bonus

```text
Der Loyalty-Core wurde auf StreamElements-nahe Punktewerte vorbereitet. Watch-Punkte können jetzt nach Subscriber-Tier berechnet werden. Resub ist im Default aktiviert. Neue Watch-User erhalten keine Sofortpunkte mehr, sondern warten bis zum ersten Intervall.
```

## 2026-06-15 – LC-CORE-CLEANUP-1 Loyalty StreamState Cleanup

```text
Alte lokale Loyalty-StreamState- und Twitch-Direktlogik wurde entfernt. Loyalty bleibt Consumer von /api/twitch/events/stream-state.
```
