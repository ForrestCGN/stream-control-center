# Modul: loyalty_giveaways

Stand: 2026-06-09  
Aktueller bestätigter Stand: LWG-4K.2

## Zweck

`loyalty_giveaways` verwaltet Giveaways, Entries/Tickets, Gewinnerziehungen, Wheel-Permissions und vorbereitete Chat-Command-/Text-Definitionen.

## Dateien

```text
backend/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

## Bestätigte Steps

```text
LWG-4D   Giveaway Backend Grundsystem
LWG-4E   Giveaway Dashboard Editor
LWG-4F.1 bestehender Communication-/CanBus
LWG-4G   Loyalty Dashboard Home / Ampel
LWG-4H   Entries/Tickets
LWG-4H.1 Entries Table Safety Fix
LWG-4I   Gewinnerziehung ohne Rad
LWG-4I.1 Winners Table Safety Fix
LWG-4J   Giveaway Wheel Claim
LWG-4J.1 Wheel Permissions Table Safety Fix
LWG-4J.2 Wheel Routes Registration Fix
LWG-4K.1 Inaktive Chat-Commands + Textvarianten
LWG-4K.2 Static Chat Routes Order Fix
```

## Datenbanktabellen

```text
loyalty_giveaways
loyalty_giveaway_rounds
loyalty_giveaway_prizes
loyalty_giveaway_events
loyalty_giveaway_entries
loyalty_giveaway_winners
loyalty_giveaway_wheel_permissions
loyalty_giveaway_command_definitions
module_texts
module_text_variants
```

Alle neuen Tabellen werden per `CREATE TABLE IF NOT EXISTS` / Safety-Net angelegt. Bestehende Daten werden nicht ersetzt.

## Bestätigte API-Bereiche

```text
Giveaway CRUD / Lifecycle
Entries/Tickets + Storno
Winners / Draw per crypto.randomInt
Wheel Permissions / Wheel Claim
Commands/Text-Setup
```

## Chat-Setup-Routen

```text
GET  /api/loyalty/giveaways/commands
GET  /api/loyalty/giveaways/texts
POST /api/loyalty/giveaways/texts
```

Wichtig: Diese statischen Routen müssen vor `/api/loyalty/giveaways/:giveawayUid` registriert werden.

## Eingetragene, aber inaktive Commands

```text
!ticket
!ticket <anzahl>
!wheel
!rad
```

Nicht verwendet:

```text
!join
```

Command-Status:

```text
enabled = false
active = false
```

Es gibt in LWG-4K.2 keine aktive Twitch-Command-Ausführung.

## Chattexte

Modulname im Textsystem:

```text
loyalty_giveaways
```

Tabellen:

```text
module_texts
module_text_variants
```

Kategorien:

```text
Chat · Tickets
Chat · Wheel/Rad
```

Aktuell bestätigt:

```text
9 Textkeys
27 Varianten
```

Stil:

```text
CGN / Altersheim / Rentner
```

## Communication-/CanBus

Das Modul nutzt den bestehenden Communication Bus direkt.

```text
module:loyalty_giveaways
heartbeat=true
status=online
```

Kein neuer Bus, kein neuer paralleler Helper.

## Nicht enthalten / bewusst offen

```text
- Keine Streamer.bot-Anbindung.
- Keine aktive Twitch-Command-Ausführung.
- Keine Punktebuchung.
- Keine Channel-Point-Anbindung.
- Keine Reward-Ausführung.
- Keine Nutzung von !join.
```

## Nächster sinnvoller Schritt

```text
LWG-4K.3 – echte Node/Twitch-Command-Struktur prüfen und Aktivierungsplan
```

Vor Aktivierung müssen die echten Twitch-/Command-Dateien geprüft werden. Keine Parallel-Systeme bauen.
