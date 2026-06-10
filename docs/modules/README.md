# Module-Dokumentation

Stand: 2026-06-09

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

## Twitch Events / Communication Bus

```text
BUS-TWITCH.1 Twitch Events Central Foundation bestätigt.
BUS-TWITCH.2 Chat Parallel Bridge vorbereitet.
```

### Regeln

```text
twitch_events ist die zentrale Twitch-Event-Schicht.
Twitch-Events sind Eingangssignale fuer Subscriber.
ACK/Replay sind vorbereitet, aber fuer Twitch-Events standardmaessig aus.
Chat wird ohne Replay, ohne ACK, ohne Queue und mit minimalem Payload gesendet.
Bestehende Direktlogik bleibt aktiv, bis der neue Subscriber-Weg erfolgreich getestet und dokumentiert wurde.
```
