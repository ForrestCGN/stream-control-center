# Modul-Doku – Loyalty

Stand: 2026-06-15

## Zweck

Das Loyalty-System verwaltet Kekskrümel/Punkte, automatische Punktevergabe, Support-Event-Boni, Glücksrad/Presets, Giveaways, Gamble, Texte und Logs im `stream-control-center`.

## Aktuelle Dashboard-Struktur

```text
Loyalty
├─ Start
├─ Core
├─ Glücksrad
├─ Presets
├─ Giveaways
├─ Gamble
├─ Einstellungen
├─ Texte
├─ Chat & Befehle
└─ Logs
```

## Core

Core ist für Punkte-Grundsystem und automatische Vergabe zuständig.

Core-Unterbereiche:

```text
Übersicht
Steuerung
Auswertung
User
Bots ignorieren
```

Core-Regeln liegen nicht mehr als eigener Core-Untertab vor, sondern zentral unter:

```text
Loyalty → Einstellungen → Core
```

Core-Logs liegen nicht mehr als eigener Core-Untertab vor, sondern zentral unter:

```text
Loyalty → Logs
```

## Einstellungen

Zentrale Config-Seite:

```text
Loyalty → Einstellungen
```

Hauptbereiche:

```text
Core
Glücksrad
Presets
Giveaways
Gamble
Chat & Befehle
```

Core enthält:

```text
Grundregeln
Automatische Punkte
Abo-Bonus bei automatischen Punkten
Geschenk-Abos / GiftBombs
Raids
```

Speicherbar bestätigt:

```text
enabled
currency.name
features.eventBonusesEnabled
watch.enabled
watch.amount
watch.intervalMinutes
features.watchEarningEnabled
autoRunner.runOnlyWhenLive
autoRunner.activeMinutes
autoRunner.maxUsersPerRun
autoRunner.includeJoinedOnly
watch.subscriberMultiplier
watch.subscriberTierAmounts.1000
watch.subscriberTierAmounts.2000
watch.subscriberTierAmounts.3000
bonuses.giftSubReceiver.mode
bonuses.raid.mode
bonuses.raid.amount
bonuses.raid.baseAmount
bonuses.raid.amountPerViewer
bonuses.raid.maxAmount
```

## Support-Events

Loyalty nutzt Twitch-Events über den Communication Bus.

Eventfluss:

```text
Twitch EventSub
→ twitch.js
→ twitch_events
→ Communication Bus
→ loyalty
```

Gebundene Events:

```text
twitch.follow.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.cheer.received
twitch.raid.received
```

## GiftSub / GiftBomb Receiver

Receiver-Modi:

```text
disabled
track_only
small_bonus
half_bonus
custom
```

Default / empfohlener Stream-Stand:

```text
track_only = Empfänger im Verlauf anzeigen, aber keine Punkte vergeben
```

Keine Fake-Receiver erzeugen.
GiftBomb-Receiver werden nur gezählt, wenn Twitch/Source echte Empfängerinformationen liefert.

## Raid-Regel

Aktuelle skalierbare Formel:

```text
min(baseAmount + viewers * amountPerViewer, maxAmount)
```

Default/empfohlen:

```text
mode = base_plus_viewers
baseAmount = 25
amountPerViewer = 2
maxAmount = 250
```

## Logs

Zentrale Ansicht:

```text
Loyalty → Logs
```

Filter:

```text
Bereich
Event
Status
Suche
```

Technische Details nur im Detailfenster.

## Texte

Zentrale Textpflege:

```text
Loyalty → Texte
```

Bereiche:

```text
Alle Textbereiche
Core
Glücksrad
Giveaways
Gamble
Chat & Befehle
Geschenk-Abos / GiftBombs
Hinweise / Fehlertexte
```

Text-APIs:

```text
/api/loyalty/giveaways/texts
/api/loyalty/games/texts
```

Regeln:

```text
Mehrere aktive Varianten pro Zweck sind erlaubt.
Deaktivieren erhält Varianten, nimmt sie aus aktiver Auswahl.
Löschen nur mit Nachfrage.
Keine Fake-IDs verwenden.
```

## Go-Live Hinweise

Vor Stream:

```text
Settings prüfen.
Runner/Live-State prüfen.
Event-Bindings prüfen.
Alert-Shadow prüfen.
Testwerte zurückstellen.
```

Nicht tun:

```text
Alerts nicht auf Bus produktiv schalten.
DB nicht ersetzen.
Punkteimport nicht blind ausführen.
```
