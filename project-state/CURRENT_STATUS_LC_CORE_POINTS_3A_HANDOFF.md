# Project State – LC-CORE-POINTS-3A Handoff

Stand: 2026-06-15

## Status

```text
Bereit für neuen Chat.
```

## Bestätigte Module/Stände

```text
loyalty.js Version 0.1.15 bestätigt.
twitch_events.js Stream-State/EventBus für online/offline bestätigt.
twitch_presence.js Presence/Activity für Watch-Punkte bestätigt.
Communication Bus funktioniert für twitch.stream.online/offline Subscriber.
```

## Zuletzt bestätigte Entscheidung

```text
forrestcgn soll dauerhaft ignoriert werden.
Der Nutzer hat den Ignored-User-Eintrag gesetzt.
```

## Nächster Block

```text
LC-CORE-POINTS-3A – Twitch Events als abonnierbare Bonus-Events vorbereiten
```

## Ziel

```text
twitch_events publiziert Bonus-relevante Twitch-Events zentral über den Communication Bus.
loyalty abonniert diese Events und ruft recordEventBonus() auf.
Weitere Module können später dieselben Events abonnieren.
```

## Geplante EventKeys

```text
twitch.follow
twitch.subscribe
twitch.resub
twitch.gift_sub
twitch.gift_bomb
twitch.cheer
twitch.raid
```

## Mapping zu Loyalty

```text
twitch.follow       -> follow
twitch.subscribe    -> subscribe
twitch.resub        -> resub
twitch.gift_sub     -> gift_sub
twitch.gift_bomb    -> gift_bomb
twitch.cheer        -> cheer
twitch.raid         -> raid
```

## Separat behandeln

```text
Tip/Donation nicht als Twitch-natives Event bauen.
Später neutrales Payment-/Donation-Event planen.
```

## Arbeitsregeln

```text
Vor Änderungen echte GitHub/dev-Dateien prüfen.
Keine Funktionalität entfernen.
Keine produktive SQLite ersetzen/löschen.
Keine Apply-/Patch-/Regex-Scripte.
ZIPs mit echten Zielpfaden ab Repo-Root.
Nach Umsetzung StepDone-Befehl angeben.
Vor Umsetzung Plan liefern und auf "go" warten.
```
