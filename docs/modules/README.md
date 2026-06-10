# Module-Dokumentation

Stand: 2026-06-10

## Aktueller Twitch-Events-Stand

```text
STEP BUS-TWITCH.1 – Twitch Events Central Foundation
```

Neue Modul-Doku:

```text
docs/modules/twitch_events.md
```

## Twitch Events – Zielbild

```text
twitch_events = zentrale Twitch-Event-Schicht
twitch.js = Twitch-Core/API/OAuth/Helix
twitch_presence.js = Heimleitung/Bot/Chat-Senden/Presence
communication_bus = zentrale Verteilung an Subscriber
```

Wichtige Regel:

```text
Keine bestehende Funktionalitaet entfernen.
Bestehende Direktlogik bleibt aktiv, bis ein Modul erfolgreich ueber twitch_events abonniert, getestet und dokumentiert wurde.
```

## Aktueller Loyalty-/Glücksrad-Stand

```text
STEP LWG-4K.2 – Static Chat Routes Order Fix bestätigt
```

## Bestätigte Bereiche

```text
LWG-4H   Entries/Tickets
LWG-4I   Gewinnerziehung ohne Rad
LWG-4J   Wheel-Giveaway + Permission + Claim + echter Wheel-Spin
LWG-4K.1 Inaktive Chat-Commands + Textvarianten
LWG-4K.2 Statische Chat-Setup-Routen korrekt vor :giveawayUid
```

## Wichtige Projektregeln

```text
Keine Funktionalität entfernen.
Streamer.bot ist für dieses System außen vor.
!join wird nicht belegt.
Commands !ticket, !wheel und !rad sind nur eingetragen, aber nicht aktiv.
Aktive Twitch-/Chat-Command-Anbindung erst nach gesonderter Planung und Go.
Chattexte laufen über helper_texts / module_text_variants und sind dashboardfähig.
```

## Dashboard

```text
Loyalty -> Loyalty Games -> Übersicht
Loyalty -> Loyalty Games -> Presets
Loyalty -> Loyalty Games -> Giveaways
Loyalty -> Loyalty Games -> Chat/Commands
Loyalty -> Loyalty Games -> Verlauf
```
