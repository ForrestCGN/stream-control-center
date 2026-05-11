# STEP202 - Loyalty / Kekskrümel Capture & Migration Prep

Stand: 2026-05-09

## Ziel

Dieser STEP startet das Loyalty-/Kekskrümel-System ohne Code- oder DB-Risiko.

Wichtig: Dieser STEP ersetzt noch nicht StreamElements und legt noch keine produktiven Tabellen an. Er sammelt und strukturiert die echten Daten, die später für die Migration gebraucht werden.

## Ausgangslage

Vorhandene Referenz:

- `project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md`

In STEP194 wurde bereits verbindlich festgelegt:

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

Aktueller geprüfter Stand:

- Es existieren noch keine Loyalty-Code-Dateien.
- Es existiert noch keine `config/loyalty.json`.
- Es existiert noch kein Dashboard-Modul für Loyalty.
- Es existieren noch keine Loyalty-DB-Tabellen.
- StreamElements ist noch nicht abgeschaltet.
- Dieser STEP ist eine Vorbereitungs- und Erfassungsstufe.

## Wichtig: STEP-Nummer

Im lokalen Projekt existieren bereits viele Dateien mit `STEP201_*` für Diagnose-/Matrix-Arbeiten vom 2026-05-08.

Deshalb wird dieser Loyalty-Start bewusst als `STEP202` geführt, damit keine Verwechslung mit den bestehenden STEP201-Diagnosedokumenten entsteht.

## Betroffene Dateien in diesem STEP

Neu:

```text
project-state/STEP202_LOYALTY_CAPTURE_AND_MIGRATION_PREP_2026-05-09.md
project-state/CHANGELOG_STEP202_LOYALTY_CAPTURE_PREP_APPEND_2026-05-09.md
project-state/CURRENT_STATUS_STEP202_LOYALTY_CAPTURE_PREP_APPEND_2026-05-09.md
project-state/FILES_STEP202_LOYALTY_CAPTURE_PREP_APPEND_2026-05-09.md
project-state/NEXT_STEPS_STEP202_LOYALTY_CAPTURE_PREP_APPEND_2026-05-09.md
```

Bewusst nicht geändert:

```text
backend/modules/loyalty.js
backend/modules/loyalty_rewards.js
backend/modules/giveaways.js
backend/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
config/loyalty.json
data/sqlite/app.sqlite
```

## Nicht Bestandteil dieses STEPs

Dieser STEP macht ausdrücklich nicht:

- keine DB-Migration
- keine neuen SQLite-Tabellen
- keine neuen API-Routen
- kein Dashboard-Modul
- keinen StreamElements-Import
- keine Änderung an Punkteständen
- keine Abschaltung von StreamElements
- keine Änderung an bestehenden Rewards/Giveaways/Games

## Zu erfassende StreamElements-Daten

### 1. Loyalty Settings

Bitte sichern:

```text
Currency Name
Watch Amount
Watch Interval
Subscriber Multiplier
Follower Bonus
Tip Bonus pro EUR
Subscriber Bonus
Cheer Bonus pro Bits
Raid Bonus
Ignored Users
Punkteverfall / Inaktivitätsregel
```

Aktuell aus STEP194 bekannter Screenshot-Stand:

```text
Currency name: Kekskrümel
Watch amount: 2
Interval: 10 Minuten
Subscriber multiplier: 3x

Follower bonus: 10
Tip bonus: 10 pro 1,00 EUR
Subscriber bonus: 50
Cheer bonus: 10 pro 100 Bits
Raid bonus: 50

Ignored users:
- streamelements
- forrestcgn

Punkteverfall:
- Zuschauerpunkte verfallen nach mehr als 1 Jahr Inaktivität
```

Diese Werte müssen vor Implementierung gegen echte aktuelle Screenshots/Exports geprüft werden.

### 2. User-Punkte

Gewünschtes Exportformat, falls StreamElements es anbietet:

```text
user_login
user_display_name
points
watchtime
rank
last_seen
```

Falls nur CSV verfügbar ist, reicht CSV.

Falls kein Export verfügbar ist, muss ein manueller oder API-basierter Importweg geklärt werden.

Wichtig:

```text
Importierte Punktestände werden später nicht still in User-Zeilen geschrieben,
sondern als Transaktion vom Typ import_streamelements_balance angelegt.
```

### 3. Stream Store / Rewards

Zu erfassen:

```text
name
command / redeem key
description
cost_points
active
category
global_cooldown
user_cooldown
quantity_limit
requires_mod_approval
auto_approve
response_text
notes
```

Fragen:

- Soll `!redeem` weiter funktionieren?
- Sollen deutsche Aliase ergänzt werden, z. B. `!einlösen`?
- Welche Rewards brauchen Moderator-Freigabe?
- Welche Rewards lösen bestehende Module aus, z. B. Sound, TTS, Challenge, Overlay?

### 4. Giveaways

Zu erfassen:

```text
title
description
ticket_cost
first_ticket_free
max_tickets_per_user
subscriber_only
subscriber_luck / weight
active / inactive
history export available?
winner history available?
```

Wichtig:

```text
Giveaway speichert später Tickets und Gewinner.
Punkte werden ausschließlich über Loyalty gebucht, reserviert oder erstattet.
```

### 5. Chat Games

Bekannte Kandidaten aus StreamElements:

```text
Bingo
Raffle
Emote Pyramids
Duel
Eight-ball
Slot Machine
Votekick
Roulette
```

Zu erfassen pro Spiel:

```text
active
command
aliases
global_cooldown_seconds
user_cooldown_seconds
min_stake
max_stake
win_chance
payout_multiplier
response_texts
overlay_needed
```

Startpriorität Empfehlung:

```text
1. Punkte anzeigen / Rang anzeigen
2. Admin-Punkte geben/nehmen
3. Import Dry-Run
4. Rewards / Store
5. Giveaways
6. einfache Games: Coinflip, Würfel, Roulette, Slots
7. Session-Games: Duel, Raffle, Bingo, Votekick
```

## Geplanter Datenfluss

### Punkte anzeigen

```text
Chat Command
-> Streamer.bot oder Twitch Chat Handler
-> Backend /api/loyalty/balance
-> Loyalty liest Kontostand
-> Antworttext über Textvarianten-System
```

### Punkte geben/nehmen

```text
Admin/Dashboard/Backend
-> Loyalty API
-> Transaktion anlegen
-> Balance aktualisieren
-> Audit/Quelle dokumentieren
```

### Reward einlösen

```text
Chat Command / Dashboard
-> Rewards-Modul
-> Loyalty prüft Punkte
-> Loyalty bucht oder reserviert Punkte
-> Reward-Modul führt Aktion aus
-> Ergebnis wird gespeichert
-> Chat/Overlay bekommt fertiges Ergebnis
```

### Giveaway Ticket

```text
Chat Command
-> Giveaway-Modul
-> Loyalty prüft Punkte
-> Loyalty bucht/reserviert Punkte
-> Giveaway speichert Ticket
-> Bei Abbruch: Loyalty erstattet sauber
```

## Geplante spätere API-Basis

Noch nicht implementieren, nur Zielbild:

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/users
GET  /api/loyalty/users/:login
GET  /api/loyalty/balance/:login
POST /api/loyalty/transactions/adjust
GET  /api/loyalty/transactions
POST /api/loyalty/reservations
POST /api/loyalty/reservations/:id/release
POST /api/loyalty/reservations/:id/capture
POST /api/loyalty/import/streamelements/dry-run
POST /api/loyalty/import/streamelements/apply
```

## Geplante spätere Tabellen

Noch nicht anlegen, nur Zielbild:

```text
loyalty_users
loyalty_transactions
loyalty_settings
loyalty_reservations
loyalty_imports
loyalty_ignored_users
```

Später separat:

```text
loyalty_rewards
loyalty_reward_categories
loyalty_redemptions
loyalty_reward_cooldowns

giveaways
giveaway_entries
giveaway_winners
giveaway_settings
giveaway_assets

loyalty_games
loyalty_game_settings
loyalty_game_sessions
loyalty_game_entries
loyalty_game_results
```

## Technische Regeln für spätere Implementierung

- Neue DB-Zugriffe bevorzugt über `backend/core/database.js`.
- Settings über vorhandene Helper wie `helper_settings.js`.
- Texte langfristig über `helper_texts.js` / `module_text_variants`.
- JSON bleibt Seed/Fallback, nicht Hauptspeicher für produktive Kontostände.
- Dashboard darf nicht direkt auf SQLite oder Dateien zugreifen.
- Overlays dürfen Punkte nie berechnen oder schreiben.
- Jede Punkteänderung muss als Transaktion nachvollziehbar sein.
- SQLite bleibt aktiv, MariaDB wird nur vorbereitet.
- Keine bestehenden SQLite-Datenbanken überschreiben oder neu bauen.

## Offene Fragen vor Code-Start

1. Kann StreamElements User-Punkte als CSV/JSON exportieren?
2. Welche Store-Items existieren aktuell?
3. Sollen vorhandene StreamElements-Commands identisch bleiben?
4. Welche Chat-Games sind wirklich aktiv und sollen zuerst nachgebaut werden?
5. Soll `!points`, `!punkte`, `!rank`, `!rang` genutzt werden?
6. Soll `!redeem` weiter genutzt werden?
7. Welche Rewards brauchen Moderator-Freigabe?
8. Sollen User Punktestände im Dashboard manuell korrigiert werden können?
9. Soll Watchtime direkt über Twitch-Presence/Chat-Presence gezählt werden?
10. Wie soll Inaktivitätsverfall praktisch angezeigt und durchgeführt werden?

## Nächster sinnvoller STEP

### STEP203 - Loyalty Core DB + Basis-API Plan

Erst nach Erfassung echter StreamElements-Daten.

Geplante Inhalte:

- `config/loyalty.json` Seed/Fallback
- `backend/modules/loyalty.js`
- sanfte Schema-Migration mit `CREATE TABLE IF NOT EXISTS`
- `/api/loyalty/status`
- `/api/loyalty/settings`
- `/api/loyalty/balance/:login`
- keine StreamElements-Abschaltung
